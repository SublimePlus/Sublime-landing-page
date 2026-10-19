/**
 * Publishes scheduled posts. Run by .github/workflows/scheduled-posts.yml
 * every ten minutes, and right after posts are scheduled from /admin.
 *
 * For every file in content/scheduled/:
 *   1. No cover yet → make one. An `imageUrl` in the file is downloaded;
 *      otherwise Kie generates one (ChatGPT image, falling back to Nano
 *      Banana) from the post or its `imagePrompt`. No approval step: the
 *      result is used as-is. After two failed attempts the post publishes
 *      with the site's default cover rather than waiting forever.
 *   2. `publishAt` has passed → move the post into content/blog/, minus the
 *      scheduler-only fields, so the next deploy puts it live.
 *
 * The workflow commits whatever changed. Needs the KIE_API_KEY secret for
 * generated covers; without it, posts still publish on time.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = process.cwd();
const SCHEDULED_DIR = path.join(ROOT, "content/scheduled");
const BLOG_DIR = path.join(ROOT, "content/blog");
const IMAGE_DIR = path.join(ROOT, "public/blog-images");
const SCHEDULER_FIELDS = ["publishAt", "imagePrompt", "imageUrl", "coverTries"];
const MAX_COVER_TRIES = 2;
/** Covers made at once; each takes 30–90 seconds on Kie. */
const PARALLEL = 4;

const KIE_API = process.env.KIE_API_BASE || "https://api.kie.ai/api/v1/jobs";
const KIE_KEY = process.env.KIE_API_KEY;
const KIE_MODELS = [
  {
    label: "ChatGPT image",
    id: process.env.KIE_GPT_IMAGE_MODEL || "gpt-image/1.5-text-to-image",
    input: (prompt) => ({ prompt, aspect_ratio: "3:2", quality: "medium" }),
  },
  {
    label: "Nano Banana",
    id: process.env.KIE_IMAGE_MODEL || "google/nano-banana",
    input: (prompt) => ({ prompt, output_format: "jpeg", image_size: "16:9" }),
  },
];

// ------------------------------------------------------------ frontmatter

/** Splits a post into its frontmatter lines and body, keeping both verbatim. */
function split(markdown) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(markdown.replace(/\r\n/g, "\n"));
  if (!match) throw new Error("missing frontmatter");
  return { lines: match[1].split("\n"), body: match[2] };
}

function join({ lines, body }) {
  return `---\n${lines.join("\n")}\n---\n${body.startsWith("\n") ? "" : "\n"}${body}`;
}

function get(post, name) {
  const line = post.lines.find((l) => l.startsWith(`${name}:`));
  if (!line) return "";
  const raw = line.slice(name.length + 1).trim();
  try {
    const value = JSON.parse(raw);
    return typeof value === "string" ? value : String(value);
  } catch {
    return raw.replace(/^["']|["']$/g, "");
  }
}

function set(post, name, value) {
  const line = `${name}: ${JSON.stringify(value)}`;
  const index = post.lines.findIndex((l) => l.startsWith(`${name}:`));
  if (index >= 0) post.lines[index] = line;
  else post.lines.push(line);
}

function remove(post, name) {
  post.lines = post.lines.filter((l) => !l.startsWith(`${name}:`));
}

// ------------------------------------------------------------ images

/** The workflow installs sharp outside the project and points NODE_PATH at it. */
function loadSharp() {
  const places = [path.join(ROOT, "package.json"), ...(process.env.NODE_PATH ? [path.join(process.env.NODE_PATH, "..", "package.json")] : [])];
  for (const place of places) {
    try {
      return createRequire(place)("sharp");
    } catch {
      // Try the next place.
    }
  }
  console.warn("sharp is not installed; covers are saved without resizing.");
  return null;
}
const sharp = loadSharp();

/** Saves image bytes as a cover, shrunk to 1600px WebP like admin uploads. */
async function saveCover(slug, bytes, contentType) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  const id = crypto.randomBytes(4).toString("hex");
  if (sharp) {
    const out = await sharp(bytes).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const name = `${slug.slice(0, 60)}-${id}.webp`;
    fs.writeFileSync(path.join(IMAGE_DIR, name), out);
    return `/blog-images/${name}`;
  }
  const ext = /png/.test(contentType) ? "png" : /webp/.test(contentType) ? "webp" : "jpg";
  const name = `${slug.slice(0, 60)}-${id}.${ext}`;
  fs.writeFileSync(path.join(IMAGE_DIR, name), bytes);
  return `/blog-images/${name}`;
}

async function download(url) {
  const response = await fetch(url, { redirect: "follow" });
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !/^image\//.test(type)) {
    throw new Error(`could not download ${url} (${response.status} ${type})`);
  }
  return { bytes: Buffer.from(await response.arrayBuffer()), type };
}

function plainText(markdown) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

/** Same template as the admin's generator (src/app/api/admin/images/suggest). */
function buildPrompt(title, excerpt, body) {
  return [
    `Create a cover image for a blog article titled "${title}".`,
    excerpt ? `Summary: ${excerpt}` : "",
    body ? `Opening of the article: ${body}` : "",
    "The image must make the article's specific subject obvious at a glance —",
    "a concrete, meaningful scene or visual metaphor for this exact topic, not a generic abstract background.",
    "Style: high-quality editorial photograph or polished 3D illustration, as used by a professional",
    "marketing or tech publication; natural lighting, sharp focus, strong composition.",
    "Subtle colour palette of deep forest green and teal with small lime-green accents.",
    "Wide landscape. Absolutely no text, letters, numbers, logos, UI screenshots or watermarks.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 3000);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function kie(pathname, init = {}) {
  const response = await fetch(`${KIE_API}/${pathname}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KIE_KEY}`, ...init.headers },
  });
  return response.json().catch(() => ({}));
}

/** One Kie image, trying the next model only if a model rejects the task. */
async function generate(prompt) {
  const errors = [];
  for (const model of KIE_MODELS) {
    const created = await kie("createTask", {
      method: "POST",
      body: JSON.stringify({ model: model.id, input: model.input(prompt) }),
    });
    const taskId = created?.data?.taskId;
    if (created?.code !== 200 || !taskId) {
      errors.push(`${model.label}: ${created?.msg || `code ${created?.code}`}`);
      continue;
    }
    // A task that was accepted is not retried with another model, so a slow
    // or failed image is never paid for twice.
    for (let waited = 0; waited < 6 * 60_000; waited += 5_000) {
      await sleep(5_000);
      const record = await kie(`recordInfo?taskId=${encodeURIComponent(taskId)}`, { method: "GET" });
      const state = record?.data?.state;
      if (state === "success") {
        const url = JSON.parse(record.data.resultJson || "{}").resultUrls?.[0];
        if (!url) throw new Error(`${model.label}: finished without an image`);
        return { ...(await download(url)), model: model.label };
      }
      if (state === "fail") throw new Error(`${model.label}: ${record.data.failMsg || "failed"}`);
    }
    throw new Error(`${model.label}: timed out`);
  }
  throw new Error(errors.join("; "));
}

async function addCover(slug, post) {
  const imageUrl = get(post, "imageUrl");
  if (imageUrl) {
    const { bytes, type } = await download(imageUrl);
    return { cover: await saveCover(slug, bytes, type), how: "downloaded from the link" };
  }
  if (!KIE_KEY) throw new Error("KIE_API_KEY is not set");
  const prompt =
    get(post, "imagePrompt") || buildPrompt(get(post, "title"), get(post, "excerpt"), plainText(post.body));
  const image = await generate(prompt);
  return { cover: await saveCover(slug, image.bytes, image.type), how: `made with ${image.model}` };
}

// ------------------------------------------------------------ main

if (!fs.existsSync(SCHEDULED_DIR)) {
  console.log("Nothing scheduled.");
  process.exit(0);
}

const files = fs.readdirSync(SCHEDULED_DIR).filter((file) => file.endsWith(".md"));
const now = Date.now();
const covered = [];
const published = [];

const posts = files.flatMap((file) => {
  const slug = file.replace(/\.md$/, "");
  try {
    return [{ slug, file: path.join(SCHEDULED_DIR, file), post: split(fs.readFileSync(path.join(SCHEDULED_DIR, file), "utf8")) }];
  } catch (error) {
    console.error(`Skipping ${file}: ${error.message}`);
    return [];
  }
});

// 1. Covers, a few at a time.
// Without a Kie key only linked images can be fetched; the rest wait, untried,
// so adding the key later still gets them covers.
const needCover = posts.filter(
  ({ post }) =>
    !get(post, "cover") &&
    Number(get(post, "coverTries") || 0) < MAX_COVER_TRIES &&
    (KIE_KEY || get(post, "imageUrl"))
);
if (!KIE_KEY) console.warn("KIE_API_KEY is not set: posts without an image publish with the default cover.");
for (let i = 0; i < needCover.length; i += PARALLEL) {
  await Promise.all(
    needCover.slice(i, i + PARALLEL).map(async (item) => {
      try {
        const { cover, how } = await addCover(item.slug, item.post);
        set(item.post, "cover", cover);
        remove(item.post, "coverTries");
        covered.push(get(item.post, "title"));
        console.log(`Cover for "${get(item.post, "title")}" ${how}: ${cover}`);
      } catch (error) {
        const tries = Number(get(item.post, "coverTries") || 0) + 1;
        set(item.post, "coverTries", String(tries));
        console.error(`Cover for "${get(item.post, "title")}" failed (attempt ${tries}): ${error.message}`);
      }
      fs.writeFileSync(item.file, join(item.post));
    })
  );
}

// 2. Publish what is due.
for (const item of posts) {
  const at = Date.parse(get(item.post, "publishAt"));
  if (Number.isNaN(at) || at > now) continue;

  // Waiting for a cover that is still being retried would hold a post past its
  // time; publish now and let it use the default cover instead.
  for (const field of SCHEDULER_FIELDS) remove(item.post, field);

  let slug = item.slug;
  for (let n = 2; fs.existsSync(path.join(BLOG_DIR, `${slug}.md`)); n++) slug = `${item.slug}-${n}`;
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), join(item.post));
  fs.rmSync(item.file);
  published.push(get(item.post, "title"));
  console.log(`Published "${get(item.post, "title")}" as /blog/${slug}`);
}

// Tell the workflow what to say in the commit.
const message = published.length
  ? published.length === 1
    ? `Publish blog post: ${published[0]}`
    : `Publish ${published.length} blog posts`
  : covered.length
    ? `Add cover images for ${covered.length} scheduled post${covered.length === 1 ? "" : "s"}`
    : "";
if (process.env.GITHUB_OUTPUT && message) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `message=${message.replace(/\n/g, " ")}\n`);
}
console.log(message || "Nothing to do yet.");
