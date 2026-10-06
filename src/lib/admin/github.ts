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
