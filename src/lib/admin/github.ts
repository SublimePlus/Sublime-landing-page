/**
 * The storage layer for admin edits: the repository itself, through the GitHub
 * contents API.
 *
 * Posts stay where they already are — Markdown in `content/blog/` — so they
 * keep their git history and stay reviewable, and the site keeps compiling
 * them at build time with no database and no runtime filesystem. The cost is
 * latency: a save is a commit, and the post is live once the deploy that
 * commit triggers has finished.
 *
 * The admin page reads through here rather than from the bundled posts, so it
 * shows what is actually committed right now — including a post saved a moment
 * ago that the running deployment has not caught up with yet.
 */

const BLOG_DIR = "content/blog";
const API = "https://api.github.com";

export type RemotePost = { slug: string; sha: string };
export type RemotePostFile = { markdown: string; sha: string };

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    throw new GitHubError(
      "Publishing is not configured: the GITHUB_TOKEN secret is not set.",
      500
    );
  }
  if (!repo) {
    // Normally supplied by `vars` in wrangler.jsonc; only missing when running
    // outside the Worker without it.
    throw new GitHubError("Publishing is not configured: GITHUB_REPO is not set.", 500);
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new GitHubError('GITHUB_REPO must look like "owner/repo".', 500);
  }

  return { token, repo, branch };
}

export function isPublishingConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function request(path: string, init: RequestInit = {}) {
  const { token } = config();

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sublime-landing-page-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    // Admin views must never serve a stale listing from a cache.
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = ((await response.json()) as { message?: string }).message ?? "";
    } catch {
      // A non-JSON error body is not worth surfacing verbatim.
    }
    // GitHub's wording names the cause but not the fix, and the fix lives in
    // GitHub settings rather than anywhere on this site.
    if (response.status === 403 && /not accessible by personal access token/i.test(detail)) {
      throw new GitHubError(
        `GitHub refused the write: the GITHUB_TOKEN lacks access. Create a fine-grained ` +
          `token with Resource owner set to "${config().repo.split("/")[0]}", this ` +
          `repository only, Contents: Read and write; if that owner is an organization ` +
          `that requires approval, approve it under its Personal access tokens settings; ` +
          `then replace the GITHUB_TOKEN secret in Cloudflare.`,
        response.status
      );
    }

    throw new GitHubError(
      detail || `GitHub responded ${response.status}.`,
      response.status
    );
  }

  return response;
}

/** Base64 that survives non-ASCII: btoa alone throws on anything above U+00FF. */
function encodeContent(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeContent(base64: string) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function listPosts(): Promise<RemotePost[]> {
  const { repo, branch } = config();

  let response: Response;
  try {
    response = await request(
      `/repos/${repo}/contents/${BLOG_DIR}?ref=${encodeURIComponent(branch)}`
    );
  } catch (error) {
    // An empty blog directory does not exist as far as the API is concerned.
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }

  const entries = (await response.json()) as { name: string; sha: string; type: string }[];

  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => ({ slug: entry.name.replace(/\.md$/, ""), sha: entry.sha }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getPostFile(slug: string): Promise<RemotePostFile | null> {
  const { repo, branch } = config();

  try {
    const response = await request(
      `/repos/${repo}/contents/${BLOG_DIR}/${slug}.md?ref=${encodeURIComponent(branch)}`
    );
    const file = (await response.json()) as { content: string; sha: string };
    return { markdown: decodeContent(file.content), sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Creates or updates a post. `sha` identifies the version being replaced —
 * GitHub rejects the write if the file moved on in the meantime, which is what
 * stops two tabs silently overwriting each other.
 */
export async function savePostFile(
  slug: string,
  markdown: string,
  sha: string | undefined,
  message: string
) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${BLOG_DIR}/${slug}.md`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: encodeContent(markdown),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function deletePostFile(slug: string, sha: string, message: string) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${BLOG_DIR}/${slug}.md`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch }),
  });
}

/**
 * The display order lives in one small JSON file next to the posts, so a
 * re-order is a single commit (and a single deploy) rather than a rewrite of
 * every post's frontmatter.
 */
const ORDER_FILE = `${BLOG_DIR}/order.json`;

export async function getOrderFile(): Promise<{ slugs: string[]; sha?: string }> {
  const { repo, branch } = config();

  try {
    const response = await request(
      `/repos/${repo}/contents/${ORDER_FILE}?ref=${encodeURIComponent(branch)}`
    );
    const file = (await response.json()) as { content: string; sha: string };
    const parsed = JSON.parse(decodeContent(file.content)) as unknown;
    const slugs = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
    return { slugs, sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return { slugs: [] };
    throw error;
  }
}

export async function saveOrderFile(slugs: string[], sha: string | undefined) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${ORDER_FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "Re-order blog posts",
      content: encodeContent(`${JSON.stringify(slugs, null, 2)}\n`),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

/**
 * Commits an uploaded image under `public/blog-images/`, which Workers Assets
 * serves as-is. `base64` is the file's bytes, already encoded by the browser.
 * The name is generated by the caller and never reused, so there is no sha.
 */
export async function saveImageFile(fileName: string, base64: string) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/public/blog-images/${fileName}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Add blog image: ${fileName}`,
      content: base64,
      branch,
    }),
  });
}

/**
 * Stores an image's bytes in the repository without committing them, so a
 * batch of scheduled posts can commit all its covers together. Returns the
 * blob sha that `addScheduledFiles` places at the image's path.
 */
export async function createImageBlob(base64: string) {
  const { repo } = config();
  const response = await request(`/repos/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: base64, encoding: "base64" }),
  });
  return ((await response.json()) as { sha: string }).sha;
}

/** The editable website copy (see src/lib/site-content.ts). */
const SITE_FILE = "content/site.json";

export async function getSiteFile(): Promise<{ json: string; sha: string } | null> {
  const { repo, branch } = config();

  try {
    const response = await request(
      `/repos/${repo}/contents/${SITE_FILE}?ref=${encodeURIComponent(branch)}`
    );
    const file = (await response.json()) as { content: string; sha: string };
    return { json: decodeContent(file.content), sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function saveSiteFile(json: string, sha: string | undefined) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${SITE_FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "Update website content",
      content: encodeContent(json),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

/**
 * Posts waiting for their publish time. They live outside `content/blog/` so
 * the build never sees them; `scripts/publish-scheduled.mjs` (run by the
 * "Scheduled posts" GitHub workflow) moves each one into `content/blog/` once
 * its time has come, generating a cover first if it has none.
 */
const SCHEDULED_DIR = "content/scheduled";

export async function listScheduled(): Promise<RemotePost[]> {
  const { repo, branch } = config();

  let response: Response;
  try {
    response = await request(
      `/repos/${repo}/contents/${SCHEDULED_DIR}?ref=${encodeURIComponent(branch)}`
    );
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }

  const entries = (await response.json()) as { name: string; sha: string; type: string }[];
  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => ({ slug: entry.name.replace(/\.md$/, ""), sha: entry.sha }));
}

export async function getScheduledFile(slug: string): Promise<RemotePostFile | null> {
  const { repo, branch } = config();

  try {
    const response = await request(
      `/repos/${repo}/contents/${SCHEDULED_DIR}/${slug}.md?ref=${encodeURIComponent(branch)}`
    );
    const file = (await response.json()) as { content: string; sha: string };
    return { markdown: decodeContent(file.content), sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function saveScheduledFile(slug: string, markdown: string, sha: string, message: string) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${SCHEDULED_DIR}/${slug}.md`, {
    method: "PUT",
    body: JSON.stringify({ message, content: encodeContent(markdown), branch, sha }),
  });
}

export async function deleteScheduledFile(slug: string, sha: string, message: string) {
  const { repo, branch } = config();

  await request(`/repos/${repo}/contents/${SCHEDULED_DIR}/${slug}.md`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch }),
  });
}

/**
 * Commits several new scheduled posts, and their covers, at once through the
 * Git data API, so a batch of twenty posts is one commit and one deploy
 * rather than forty.
 */
export async function addScheduledFiles(
  files: { slug: string; markdown: string }[],
  images: { path: string; sha: string }[],
  message: string
) {
  const { repo, branch } = config();
  const refPath = `/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;

  const ref = (await (await request(refPath)).json()) as { object: { sha: string } };
  const parent = (await (
    await request(`/repos/${repo}/git/commits/${ref.object.sha}`)
  ).json()) as { tree: { sha: string } };

  const tree = (await (
    await request(`/repos/${repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({
        base_tree: parent.tree.sha,
        tree: [
          ...files.map((file) => ({
            path: `${SCHEDULED_DIR}/${file.slug}.md`,
            mode: "100644",
            type: "blob",
            content: file.markdown,
          })),
          // Covers uploaded on the schedule page, stored earlier as blobs.
          ...images.map((image) => ({
            path: `public${image.path}`,
            mode: "100644",
            type: "blob",
            sha: image.sha,
          })),
        ],
      }),
    })
  ).json()) as { sha: string };

  const commit = (await (
    await request(`/repos/${repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
    })
  ).json()) as { sha: string };

  // Not forced: if someone else committed in between, GitHub rejects this and
  // the admin is asked to try again rather than their commit being lost.
  await request(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
}
