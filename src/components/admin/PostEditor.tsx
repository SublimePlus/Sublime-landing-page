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
async function uploadImage(file: File): Promise<string> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

  const response = await fetch("/api/admin/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, data }),
  });
  const result = (await response.json().catch(() => ({}))) as { path?: string; error?: string };
  if (!response.ok || !result.path) throw new Error(result.error ?? "Could not upload the image.");
  return result.path;
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
        if (data.post) setDraft({ ...BLANK, ...data.post });
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

  async function onCoverFile(file: File | undefined) {
    if (!file) return;
    setUploading("cover");
    setError(null);
    try {
      const path = await uploadImage(file);
      setCoverPreview(URL.createObjectURL(file));
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
            Optional. PNG, JPEG, WebP or GIF, up to 3 MB; a 16:9 image works best.
            Without one, the post uses the generated cover below.
          </span>
          <FieldError message={fieldErrors.cover} />
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
