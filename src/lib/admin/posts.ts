import { TONES, type PostTone } from "@/lib/blog";

/**
 * Validation and Markdown serialisation for posts written from the admin page.
 *
 * This is the gate that matters. A post committed from /admin becomes a file
 * the next build compiles, so anything malformed here does not produce a bad
 * page — it fails the build and stops the site deploying. Everything is
 * checked before a commit goes out, not after.
 *
 * `scripts/build-blog-data.mjs` validates the same rules again at build time.
 * The duplication is deliberate: the generator is a plain .mjs run by node and
 * cannot import this module, and it has to keep working for posts added by
 * hand in an editor rather than through /admin. Keep the two in step.
 */

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tone: PostTone;
  body: string;
};

export type ValidationError = { field: string; message: string };

/** Mirrors the slug rule in `getPostBySlug`, and what a filename may contain. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validatePost(input: Partial<PostInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.slug || !SLUG_RE.test(input.slug)) {
    errors.push({
      field: "slug",
      message: "Use lowercase letters, numbers and single hyphens, e.g. how-we-use-ai.",
    });
  }
  if (!input.title?.trim()) {
    errors.push({ field: "title", message: "A title is required." });
  }
  if (!input.excerpt?.trim()) {
    errors.push({
      field: "excerpt",
      message: "An excerpt is required — it is the card and search description.",
    });
  }
  if (!input.date || !DATE_RE.test(input.date)) {
    errors.push({ field: "date", message: "Use a YYYY-MM-DD date." });
  } else if (Number.isNaN(new Date(input.date).getTime())) {
    errors.push({ field: "date", message: "That date does not exist." });
  }
  if (!input.tone || !TONES.includes(input.tone)) {
    errors.push({ field: "tone", message: `Tone must be one of ${TONES.join(", ")}.` });
  }
  if (!input.body?.trim()) {
    errors.push({ field: "body", message: "The post body is empty." });
  }

  return errors;
}

/**
 * Frontmatter values are written with JSON.stringify so quotes, colons and
 * backslashes in a title cannot break the YAML and take the build down with
 * them. JSON string escaping is valid inside a YAML double-quoted scalar.
 */
export function serializePost(input: PostInput) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(input.title.trim())}`,
    `excerpt: ${JSON.stringify(input.excerpt.trim())}`,
    `date: ${JSON.stringify(input.date)}`,
    `tone: ${JSON.stringify(input.tone)}`,
    "---",
  ].join("\n");

  // Normalise line endings; a CRLF body from a Windows paste otherwise shows
  // up as stray characters in the rendered HTML.
  const body = input.body.replace(/\r\n/g, "\n").trim();

  return `${frontmatter}\n\n${body}\n`;
}

/** Splits a stored file back into the fields the editor shows. */
export function parsePost(slug: string, markdown: string): PostInput {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(markdown);
  if (!match) {
    return { slug, title: "", excerpt: "", date: "", tone: "teal", body: markdown.trim() };
  }

  const [, rawFrontmatter, body] = match;
  const field = (name: string) => {
    const line = new RegExp(`^${name}:\\s*(.*)$`, "m").exec(rawFrontmatter);
    if (!line) return "";
    const value = line[1].trim();
    try {
      // Values this module writes are JSON-quoted; hand-written ones may not be.
      return typeof JSON.parse(value) === "string" ? (JSON.parse(value) as string) : value;
    } catch {
      return value.replace(/^["']|["']$/g, "");
    }
  };

  const tone = field("tone") as PostTone;

  return {
    slug,
    title: field("title"),
    excerpt: field("excerpt"),
    date: field("date"),
    tone: TONES.includes(tone) ? tone : "teal",
    body: body.trim(),
  };
}
