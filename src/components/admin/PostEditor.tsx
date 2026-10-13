"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TONES, type PostTone } from "@/lib/blog";
import { slugify } from "@/lib/admin/posts";

type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tone: PostTone;
  author: string;
  cover: string;
  archived: boolean;
  body: string;
};

const BLANK: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  tone: "teal",
  author: "",
  cover: "",
  archived: false,
  body: "",
};

/**
 * Reads a file as base64 and commits it through /api/admin/images. Returns the
 * public path. The file only exists on the live site after the deploy that
 * commit triggers, so callers preview it from the local file meanwhile.
 */
/** Covers display at most ~1200px wide; 1600 leaves room for sharp screens. */
const MAX_IMAGE_WIDTH = 1600;

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Shrinks an image in the browser before it is uploaded: scaled to at most
 * MAX_IMAGE_WIDTH and re-encoded as WebP (JPEG where WebP encoding is missing).
 *
 * This matters twice over. Uploads travel as base64 JSON, and parsing a
 * multi-megabyte body can exceed the Worker's per-request CPU limit (error
 * 1102). And every visitor downloads the cover, so a 2 MB PNG is a slow page.
 * GIFs are left alone so animations survive.
 */
async function compressImage(blob: Blob): Promise<{ type: string; data: string }> {
  if (blob.type === "image/gif") return { type: blob.type, data: await blobToBase64(blob) };

  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
    let out = await encode("image/webp");
    // Browsers that cannot encode WebP silently hand back a PNG instead.
    if (!out || out.type !== "image/webp") out = await encode("image/jpeg");
    // Keep the original if re-encoding somehow made it bigger.
    if (out && out.size < blob.size) return { type: out.type, data: await blobToBase64(out) };
  } catch {
    // Undecodable here (rare); fall through and let the server validate it.
  }
  return { type: blob.type, data: await blobToBase64(blob) };
}

async function uploadImage(file: File): Promise<string> {
  const { type, data } = await compressImage(file);
  return uploadImageData(file.name, type, data);
}

/** Same as `uploadImage`, for bytes already in base64 (a generated suggestion). */
async function uploadImageData(name: string, type: string, data: string): Promise<string> {
  const response = await fetch("/api/admin/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, data }),
  });
  const result = (await response.json().catch(() => ({}))) as { path?: string; error?: string };
  if (!response.ok || !result.path) throw new Error(result.error ?? "Could not upload the image.");
  return result.path;
}

/**
 * A suggested cover. Synchronous providers return the bytes (`data`); Kie
 * returns a hosted `url` plus the `taskId` the server downloads it through.
 */
type Suggestion = {
  provider: string;
  type?: string;
  data?: string;
  url?: string;
  taskId?: string;
  prompt?: string;
  note?: string;
};

const PROVIDER_NAMES: Record<string, string> = {
  kie: "Kie.ai (nano-banana)",
  gemini: "Google Gemini",
  openai: "ChatGPT (OpenAI)",
  cloudflare: "Cloudflare Workers AI",
};

/**
 * Pulls the image out of whichever provider answered. Gemini and OpenAI
 * responses arrive untouched (see the route for why), so they are parsed here.
 */
function extractImage(provider: string, json: unknown): { type: string; data: string } | null {
  if (provider === "gemini") {
    type Part = { inlineData?: { mimeType?: string; data?: string }; inline_data?: { mime_type?: string; data?: string } };
    const parts =
      (json as { candidates?: { content?: { parts?: Part[] } }[] }).candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData ?? (part.inline_data && { mimeType: part.inline_data.mime_type, data: part.inline_data.data });
      if (inline?.data) return { type: inline.mimeType || "image/png", data: inline.data };
    }
    return null;
  }
  if (provider === "openai") {
    const b64 = (json as { data?: { b64_json?: string }[] }).data?.[0]?.b64_json;
    return b64 ? { type: "image/jpeg", data: b64 } : null;
  }
  const flat = json as { type?: string; data?: string };
  return flat.data && flat.type ? { type: flat.type, data: flat.data } : null;
}

/** Asks the server for a cover. Pure fetch, so effects can call it directly. */
async function fetchSuggestion(
  title: string,
  excerpt: string,
  body: string
): Promise<{ suggestion: Suggestion } | { error: string }> {
  try {
    const response = await fetch("/api/admin/images/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, body }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) return { error: json.error ?? "Could not generate an image." };

    const provider = response.headers.get("X-Image-Provider") ?? "cloudflare";
    const rawNote = response.headers.get("X-Image-Note");

    if (provider === "kie") {
      const { taskId, prompt } = json as { taskId?: string; prompt?: string };
      if (!taskId) return { error: "Kie did not start the image." };
      // Kie works asynchronously. Polling is free; only the task costs credits.
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const poll = await fetch(`/api/admin/images/suggest?taskId=${encodeURIComponent(taskId)}`, {
          cache: "no-store",
        });
        const status = (await poll.json().catch(() => ({}))) as {
          state?: string;
          url?: string;
          error?: string;
        };
        if (!poll.ok || status.state === "fail") {
          return { error: status.error ?? "Kie could not make this image." };
        }
        if (status.state === "success" && status.url) {
          return { suggestion: { provider, url: status.url, taskId, prompt } };
        }
      }
      return { error: "Kie is taking too long. Try again in a minute." };
    }

    const image = extractImage(provider, json);
    if (!image) {
      return { error: `${PROVIDER_NAMES[provider] ?? provider} returned no image. Try again.` };
    }
    return {
      suggestion: { ...image, provider, note: rawNote ? decodeURIComponent(rawNote) : undefined },
    };
  } catch {
    return { error: "Could not reach the server." };
  }
}

const FIELD =
  "mt-2 w-full rounded-xl border border-pine/15 bg-white px-4 py-3 text-pine outline-none focus:border-teal dark:border-white/15 dark:bg-night/60 dark:text-white";
const LABEL = "block text-sm font-medium text-pine dark:text-white";

export function PostEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isNew = !slug;

  const [draft, setDraft] = useState<Draft>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Only auto-fill the slug until the author types one; silently rewriting a
  // slug they chose would change a published URL under them.
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploading, setUploading] = useState<"cover" | "body" | null>(null);
  // A just-uploaded image is not on the live site until the deploy finishes, so
  // the cover preview shows the local file until then.
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  // A generated cover waiting for the admin to accept or reject it. It exists
  // only in this tab until accepted; nothing is committed before that.
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  // Images are only generated on an explicit click: a paid provider spends
  // credits per image, so nothing runs just because the editor opened.

  useEffect(() => {
    if (isNew) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/admin/posts/${slug}`, { cache: "no-store" });
        const data = (await response.json()) as { post?: Draft; error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? "Could not load the post.");
          return;
        }
        if (data.post) {
          const post = { ...BLANK, ...data.post };
          setDraft(post);
        }
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNew, slug]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setSaved(false);
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  }

  async function suggestCover(title = draft.title, excerpt = draft.excerpt, body = draft.body) {
    if (!title.trim()) {
      setSuggestError("Write a title first; the image is generated from it.");
      return;
    }
    setSuggesting(true);
    setSuggestError(null);
    const result = await fetchSuggestion(title, excerpt, body);
    setSuggesting(false);
    if ("error" in result) setSuggestError(result.error);
    else setSuggestion(result.suggestion);
  }

  async function acceptSuggestion() {
    if (!suggestion) return;
    setUploading("cover");
    setError(null);
    try {
      const name = `${draft.slug || slugify(draft.title) || "cover"}-ai`;
      const original = suggestion.taskId
        ? await (async () => {
            const response = await fetch(
              `/api/admin/images/suggest?taskId=${encodeURIComponent(suggestion.taskId!)}&download=1`
            );
            if (!response.ok) throw new Error("Could not download the generated image.");
            return response.blob();
          })()
        : await (await fetch(`data:${suggestion.type};base64,${suggestion.data}`)).blob();
      const compressed = await compressImage(original);
      const path = await uploadImageData(name, compressed.type, compressed.data);
      setCoverPreview(suggestion.url ?? `data:${suggestion.type};base64,${suggestion.data}`);
      setSuggestion(null);
      update("cover", path);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function onCoverFile(file: File | undefined) {
    if (!file) return;
    setUploading("cover");
    setError(null);
    try {
      const path = await uploadImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setSuggestion(null);
      update("cover", path);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function onBodyImage(file: File | undefined) {
    if (!file) return;
    setUploading("body");
    setError(null);
    try {
      const path = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
      const snippet = `\n\n![${alt}](${path})\n\n`;
      const textarea = bodyRef.current;
      const at = textarea ? textarea.selectionStart : draft.body.length;
      update("body", draft.body.slice(0, at) + snippet + draft.body.slice(at));
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, isNew }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        errors?: { field: string; message: string }[];
      };

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(Object.fromEntries(data.errors.map((e) => [e.field, e.message])));
        } else {
          setError(data.error ?? "Could not save the post.");
        }
        return;
      }

      setSaved(true);
      if (isNew) router.replace(`/admin/edit/${draft.slug}`);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone dark:text-white/60">Loading…</p>;
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="glass-panel space-y-5 rounded-2xl p-6">
        <label className={LABEL}>
          Title
          <input
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
            className={FIELD}
            required
          />
          <FieldError message={fieldErrors.title} />
        </label>

        <label className={LABEL}>
          Slug
          <input
            value={draft.slug}
            onChange={(event) => {
              setSlugTouched(true);
              update("slug", event.target.value);
            }}
            disabled={!isNew}
            className={`${FIELD} font-mono text-sm disabled:opacity-60`}
            required
          />
          <span className="mt-1 block text-xs text-stone dark:text-white/50">
            {isNew
              ? "The URL: /blog/" + (draft.slug || "…")
              : "Fixed after publishing — changing it would break the live URL."}
          </span>
          <FieldError message={fieldErrors.slug} />
        </label>

        <label className={LABEL}>
          Excerpt
          <textarea
            value={draft.excerpt}
            onChange={(event) => update("excerpt", event.target.value)}
            rows={3}
            className={FIELD}
            required
          />
          <span className="mt-1 block text-xs text-stone dark:text-white/50">
            Shown on the card and used as the search and social description.
          </span>
          <FieldError message={fieldErrors.excerpt} />
        </label>

        <label className={LABEL}>
          Author
          <input
            value={draft.author}
            onChange={(event) => update("author", event.target.value)}
            placeholder="e.g. Mayar"
            className={FIELD}
          />
          <span className="mt-1 block text-xs text-stone dark:text-white/50">
            Optional. Shown as &ldquo;By …&rdquo; on the post and its card.
          </span>
          <FieldError message={fieldErrors.author} />
        </label>

        <div className={LABEL}>
          Cover image
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {(coverPreview || draft.cover) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview ?? draft.cover}
                alt="Cover preview"
                className="h-24 w-40 rounded-xl border border-pine/15 object-cover dark:border-white/15"
              />
            )}
            <label className="cursor-pointer rounded-full border border-pine/15 px-4 py-2 text-sm font-semibold text-pine hover:border-teal dark:border-white/15 dark:text-white">
              {uploading === "cover" ? "Uploading…" : draft.cover ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={uploading !== null}
                onChange={(event) => {
                  void onCoverFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {draft.cover && (
              <button
                type="button"
                onClick={() => {
                  setCoverPreview(null);
                  update("cover", "");
                }}
                className="text-sm font-semibold text-red-600 dark:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          <span className="mt-1 block text-xs font-normal text-stone dark:text-white/50">
            Optional. PNG, JPEG, WebP or GIF; large images are shrunk automatically. 16:9 works best.
            Without one, the post uses the generated cover below.
          </span>
          <FieldError message={fieldErrors.cover} />

          {!draft.cover && (
            <div className="mt-4 rounded-xl border border-dashed border-teal/50 p-4 font-normal">
              <p className="text-sm font-medium text-pine dark:text-white">
                Suggested cover (AI-generated from the post)
              </p>
              {suggesting && (
                <p className="mt-2 text-sm text-stone dark:text-white/60">
                  Generating an image for this post… this can take up to a minute.
                </p>
              )}
              {suggestError && !suggesting && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{suggestError}</p>
              )}
              {suggestion && !suggesting && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={suggestion.url ?? `data:${suggestion.type};base64,${suggestion.data}`}
                  alt="Suggested cover"
                  className="mt-3 aspect-[16/9] w-full max-w-md rounded-xl object-cover"
                />
              )}
              {suggestion && !suggesting && (
                <p className="mt-1 text-xs text-stone dark:text-white/50">
                  Made with {PROVIDER_NAMES[suggestion.provider] ?? suggestion.provider}.
                  {suggestion.note && <> {suggestion.note}</>}
                </p>
              )}
              {suggestion?.prompt && !suggesting && (
                <details className="mt-1 text-xs text-stone dark:text-white/50">
                  <summary className="cursor-pointer">Prompt written from the post</summary>
                  <p className="mt-1">{suggestion.prompt}</p>
                </details>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {suggestion && !suggesting && (
                  <button
                    type="button"
                    onClick={() => void acceptSuggestion()}
                    disabled={uploading !== null}
                    className="neon-teal-btn rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
                  >
                    {uploading === "cover" ? "Uploading…" : "Use this image"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void suggestCover()}
                  disabled={suggesting || uploading !== null}
                  className="rounded-full border border-pine/15 px-4 py-2 text-sm font-semibold text-pine hover:border-teal disabled:opacity-50 dark:border-white/15 dark:text-white"
                >
                  {suggestion ? "Try another" : "Generate an image"}
                </button>
                {suggestion && !suggesting && (
                  <button
                    type="button"
                    onClick={() => setSuggestion(null)}
                    className="text-sm font-semibold text-stone hover:text-pine dark:text-white/60 dark:hover:text-white"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-stone dark:text-white/50">
                Each click makes one image (paid providers use credits per image). Nothing is
                saved until you click &ldquo;Use this image&rdquo;, then save the post. Or upload your own above.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={LABEL}>
            Date
            <input
              type="date"
              value={draft.date}
              onChange={(event) => update("date", event.target.value)}
              className={FIELD}
              required
            />
            <FieldError message={fieldErrors.date} />
          </label>

          <label className={LABEL}>
            Cover tone
            <select
              value={draft.tone}
              onChange={(event) => update("tone", event.target.value as PostTone)}
              className={FIELD}
            >
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-stone dark:text-white/50">
              Picks the generated cover gradient.
            </span>
          </label>
        </div>

        <label className="flex items-start gap-3 text-sm text-pine dark:text-white">
          <input
            type="checkbox"
            checked={draft.archived}
            onChange={(event) => update("archived", event.target.checked)}
            className="mt-1 h-4 w-4 accent-teal"
          />
          <span>
            <span className="font-medium">Archived</span>
            <span className="block text-xs text-stone dark:text-white/50">
              Hidden from the site but kept here, so it can be restored later.
            </span>
          </span>
        </label>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className={LABEL}>
          <span className="flex flex-wrap items-center justify-between gap-2">
            Body (Markdown)
            <label className="cursor-pointer rounded-full border border-pine/15 px-3 py-1 text-xs font-semibold hover:border-teal dark:border-white/15">
              {uploading === "body" ? "Uploading…" : "Insert image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={uploading !== null}
                onChange={(event) => {
                  void onBodyImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </span>
          <textarea
            ref={bodyRef}
            aria-label="Body (Markdown)"
            value={draft.body}
            onChange={(event) => update("body", event.target.value)}
            rows={22}
            className={`${FIELD} font-mono text-sm leading-relaxed`}
            required
          />
          <span className="mt-1 block text-xs text-stone dark:text-white/50">
            Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>,{" "}
            <code>- list</code>, <code>[link](url)</code>, <code>![alt](image)</code>. HTML is
            escaped, not rendered. Uploaded images appear once the deploy finishes.
          </span>
          <FieldError message={fieldErrors.body} />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {saved && (
        <p className="rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-pine dark:text-white">
          Saved and committed. The post goes live once the deploy it triggered
          finishes — usually a minute or two.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading !== null}
          className="neon-teal-btn rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
        >
          {saving ? "Saving…" : isNew ? "Publish post" : "Save changes"}
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-pine/15 px-6 py-3 text-sm font-semibold text-pine hover:border-teal dark:border-white/15 dark:text-white"
        >
          Back
        </Link>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
      {message}
    </span>
  );
}
