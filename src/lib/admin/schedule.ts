import { parsePost, serializePost, slugify, validatePost, type PostInput, type ValidationError } from "@/lib/admin/posts";

/**
 * A post waiting in `content/scheduled/` for its publish time.
 *
 * The file is an ordinary post plus a few frontmatter fields that only the
 * scheduler reads, and that `scripts/publish-scheduled.mjs` strips when it
 * moves the post into `content/blog/`:
 *   publishAt    — ISO timestamp (UTC) the post goes live at
 *   imagePrompt  — optional prompt for the generated cover
 *   imageUrl     — optional image to download as the cover instead
 *   coverTries   — how many times cover generation has failed (written by the script)
 */
export type ScheduledInput = Omit<PostInput, "archived"> & {
  publishAt: string;
  imagePrompt: string;
  imageUrl: string;
};

export function validateScheduled(input: Partial<ScheduledInput>): ValidationError[] {
  const errors = validatePost({ ...input, archived: false });
  if (!input.publishAt || Number.isNaN(Date.parse(input.publishAt))) {
    errors.push({ field: "publishAt", message: "Pick a publish date and time." });
  }
  if (input.imagePrompt && input.imagePrompt.length > 2000) {
    errors.push({ field: "imagePrompt", message: "Keep the image prompt under 2000 characters." });
  }
  if (input.imageUrl && !/^https:\/\/\S+$/.test(input.imageUrl)) {
    errors.push({ field: "imageUrl", message: "Image links must start with https://." });
  }
  return errors;
}

export function serializeScheduled(input: ScheduledInput) {
  const post = serializePost({ ...input, archived: false });
  const extra = [
    `publishAt: ${JSON.stringify(new Date(input.publishAt).toISOString())}`,
    ...(input.imagePrompt?.trim() ? [`imagePrompt: ${JSON.stringify(input.imagePrompt.trim())}`] : []),
    ...(input.imageUrl?.trim() ? [`imageUrl: ${JSON.stringify(input.imageUrl.trim())}`] : []),
  ].join("\n");
  // serializePost always opens with "---\n"; add the scheduler fields right after.
  return post.replace(/^---\n/, `---\n${extra}\n`);
}

function field(markdown: string, name: string) {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? "";
  const line = new RegExp(`^${name}:\\s*(.*)$`, "m").exec(frontmatter);
  if (!line) return "";
  try {
    const value = JSON.parse(line[1].trim()) as unknown;
    return typeof value === "string" ? value : String(value);
  } catch {
    return line[1].trim().replace(/^["']|["']$/g, "");
  }
}

export function parseScheduled(slug: string, markdown: string): ScheduledInput & { coverTries: number } {
  const post = parsePost(slug, markdown);
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    tone: post.tone,
    author: post.author,
    cover: post.cover,
    body: post.body,
    publishAt: field(markdown, "publishAt"),
    imagePrompt: field(markdown, "imagePrompt"),
    imageUrl: field(markdown, "imageUrl"),
    coverTries: Number(field(markdown, "coverTries")) || 0,
  };
}

/** Moves the publish time in an existing file, leaving everything else as written. */
export function withPublishAt(markdown: string, publishAt: string) {
  const value = `publishAt: ${JSON.stringify(new Date(publishAt).toISOString())}`;
  return /^publishAt:.*$/m.test(markdown)
    ? markdown.replace(/^publishAt:.*$/m, value)
    : markdown.replace(/^---\n/, `---\n${value}\n`);
}

/** A slug for `title` that is not in `taken`; adds -2, -3… on a clash. */
export function uniqueSlug(title: string, taken: Set<string>) {
  const base = slugify(title) || "post";
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}
