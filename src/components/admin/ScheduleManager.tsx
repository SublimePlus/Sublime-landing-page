"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { fetchSuggestion, suggestionBlob, type ImageModel } from "./cover-generator";
import { stageImage } from "./image-upload";
import { postsFromFile, toLocalInput, type DraftPost } from "./import-posts";
import { CSV_TEMPLATE, MARKDOWN_TEMPLATE } from "./schedule-templates";

/**
 * Bulk scheduling: upload a file of posts, check them in the preview, fix any
 * cover, schedule.
 *
 * Covers are made right after import (ChatGPT image on Kie by default) and
 * can be regenerated or replaced before scheduling. They are stored as staged
 * blobs and committed together with the posts in one commit. The "Scheduled
 * posts" GitHub workflow then publishes each post at its time, and makes a
 * cover for any post that still has none.
 */

type Scheduled = {
  slug: string;
  title: string;
  publishAt: string;
  cover: string;
  imageUrl: string;
  coverTries: number;
};

type Cover =
  | { status: "none" }
  | { status: "working" }
  | { status: "error"; error: string }
  | { status: "ready"; path: string; sha: string; preview: string; label: string };

type Draft = DraftPost & { cover: Cover };

const FIELD =
  "mt-1 w-full rounded-xl border border-pine/15 bg-white px-3 py-2 text-sm text-pine outline-none focus:border-teal dark:border-white/15 dark:bg-night/60 dark:text-white";
const SMALL_BUTTON =
  "rounded-full border border-pine/15 px-3 py-1.5 text-xs font-semibold text-pine hover:border-teal disabled:opacity-40 dark:border-white/15 dark:text-white";
const LABEL = "text-xs font-semibold uppercase tracking-wide text-stone dark:text-white/50";
/** Covers generated at once; each takes 30–90 seconds. */
const PARALLEL_COVERS = 3;

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No time set";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const timeZone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "your local time";
  }
})();

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ScheduleManager() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduled, setScheduled] = useState<Scheduled[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  // When the list was loaded; rows compare against it to show "publishing soon".
  const [loadedAt, setLoadedAt] = useState(0);
  const [autoCovers, setAutoCovers] = useState(true);
  const [model, setModel] = useState<ImageModel>("gpt");
  /** Index of the post open in the preview window, or null. */
  const [previewing, setPreviewing] = useState<number | null>(null);
  // "Fill times" helper: first post at `start`, then one every `everyDays`.
  const [start, setStart] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return toLocalInput(tomorrow);
  });
  const [everyDays, setEveryDays] = useState(1);

  // Event handlers read the latest drafts through this, not a stale closure.
  const draftsRef = useRef<Draft[]>([]);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/schedule", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          posts?: Scheduled[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? "Could not load scheduled posts.");
          setScheduled([]);
          return;
        }
        setScheduled(data.posts ?? []);
        setLoadedAt(Date.now());
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function update(key: string, patch: Partial<Draft>) {
    setDrafts((current) => current.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  /** Generates (or regenerates) one post's cover with the chosen model. */
  async function generateCover(key: string) {
    const post = draftsRef.current.find((d) => d.key === key);
    if (!post) return;
    update(key, { cover: { status: "working" }, imageUrl: "" });
    const result = await fetchSuggestion(post.title, post.excerpt, post.body, post.imagePrompt, model);
    if ("error" in result) {
      update(key, { cover: { status: "error", error: result.error } });
      return;
    }
    try {
      const staged = await stageImage(`${post.title}-ai`, await suggestionBlob(result.suggestion));
      const label = result.suggestion.modelLabel ?? result.suggestion.provider;
      // The post may have been removed while its cover was being made.
      if (draftsRef.current.some((d) => d.key === key)) {
        update(key, { cover: { status: "ready", ...staged, label } });
      }
    } catch (stageError) {
      update(key, { cover: { status: "error", error: (stageError as Error).message } });
    }
  }

  async function generateMany(keys: string[]) {
    const queue = [...keys];
    const worker = async () => {
      for (let key = queue.shift(); key; key = queue.shift()) await generateCover(key);
    };
    await Promise.all(Array.from({ length: PARALLEL_COVERS }, worker));
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setNotice(null);
    const added: Draft[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const posts = await postsFromFile(file);
        if (posts.length === 0) problems.push(`${file.name}: no posts found.`);
        added.push(...posts.map((post) => ({ ...post, cover: { status: "none" } as Cover })));
      } catch (fileError) {
        problems.push((fileError as Error).message);
      }
    }
    draftsRef.current = [...draftsRef.current, ...added];
    setDrafts(draftsRef.current);
    if (problems.length) setError(problems.join(" "));
    if (added.length === 0) return;

    const needCovers = added.filter((d) => !d.imageUrl).map((d) => d.key);
    setNotice(
      `Imported ${added.length} post${added.length === 1 ? "" : "s"}.` +
        (autoCovers && needCovers.length
          ? ` Making ${needCovers.length} cover${needCovers.length === 1 ? "" : "s"} now; this takes a minute or two.`
          : "") +
        " Click Preview to read them."
    );
    if (autoCovers) await generateMany(needCovers);
  }

  function fillTimes(onlyEmpty: boolean) {
    const first = new Date(start);
    if (Number.isNaN(first.getTime())) return;
    setDrafts((current) => {
      // Counted inside the updater: React may run it twice in development.
      let i = 0;
      return current.map((d) => {
        if (onlyEmpty && d.when) return d;
        const at = new Date(first);
        at.setDate(at.getDate() + i * Math.max(0, everyDays));
        i++;
        return { ...d, when: toLocalInput(at) };
      });
    });
  }

  async function onOwnCover(key: string, file: File | undefined) {
    if (!file) return;
    update(key, { cover: { status: "working" }, imageUrl: "" });
    try {
      const staged = await stageImage(file.name, file);
      update(key, { cover: { status: "ready", ...staged, label: "your upload" } });
    } catch (uploadError) {
      update(key, { cover: { status: "error", error: (uploadError as Error).message } });
    }
  }

  const missing = drafts.filter((d) => !d.title.trim() || !d.body.trim() || !d.when);
  const working = drafts.filter((d) => d.cover.status === "working").length;

  async function onSchedule() {
    if (drafts.length === 0 || missing.length > 0 || working > 0) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: drafts.map((d) => ({
            title: d.title,
            excerpt: d.excerpt,
            body: d.body,
            author: d.author,
            cover: d.cover.status === "ready" ? d.cover.path : "",
            imageUrl: d.cover.status === "ready" ? "" : d.imageUrl,
            imagePrompt: d.imagePrompt,
            publishAt: new Date(d.when).toISOString(),
            date: d.when.slice(0, 10),
            tone: "teal",
          })),
          images: drafts.flatMap((d) =>
            d.cover.status === "ready" ? [{ path: d.cover.path, sha: d.cover.sha }] : []
          ),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        scheduled?: string[];
        error?: string;
        problems?: { index: number; message: string }[];
      };
      if (!response.ok) {
        setError(
          data.problems
            ? data.problems
                .map((p) => `"${drafts[p.index]?.title || `Post ${p.index + 1}`}": ${p.message}`)
                .join(" ")
            : (data.error ?? "Could not schedule the posts.")
        );
        return;
      }
      const count = data.scheduled?.length ?? drafts.length;
      setDrafts([]);
      setPreviewing(null);
      setNotice(`Scheduled ${count} post${count === 1 ? "" : "s"}. Each one goes live at its time.`);
      setReloadToken((t) => t + 1);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  async function act(slug: string, action: "now" | "cancel" | { at: string }) {
    if (action === "cancel" && !window.confirm("Cancel this scheduled post? It will be deleted.")) return;
    setBusy(slug);
    setError(null);
    try {
      const response = await fetch(`/api/admin/schedule/${slug}`, {
        method: action === "cancel" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body:
          action === "cancel"
            ? undefined
            : JSON.stringify({ publishAt: action === "now" ? "now" : new Date(action.at).toISOString() }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not update that post.");
        return;
      }
      setNotice(
        action === "now"
          ? "Publishing now. It goes live within about 10 minutes."
          : action === "cancel"
            ? "Scheduled post cancelled."
            : "New time saved."
      );
      setReloadToken((t) => t + 1);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Upload */}
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="text-base font-semibold text-pine dark:text-white">1. Import a file of posts</h2>
        <p className="mt-1 text-sm text-stone dark:text-white/60">
          One file can hold many posts, each with its own date and time. Use a <b>Word (.docx)</b>,{" "}
          <b>Markdown (.md)</b>, <b>text (.txt)</b> or <b>CSV</b> file in the template format.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/templates/blog-posts-template.docx" download className={SMALL_BUTTON}>
            Download Word template
          </a>
          <button
            type="button"
            onClick={() => download("blog-posts-template.md", MARKDOWN_TEMPLATE, "text/markdown")}
            className={SMALL_BUTTON}
          >
            Download Markdown template
          </button>
          <button
            type="button"
            onClick={() => download("blog-posts-template.csv", CSV_TEMPLATE, "text/csv")}
            className={SMALL_BUTTON}
          >
            Download CSV template
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-pine dark:text-white">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoCovers}
              onChange={(e) => setAutoCovers(e.target.checked)}
              className="h-4 w-4 accent-teal"
            />
            Make covers automatically for posts without an image
          </label>
          <label className="flex items-center gap-2">
            Image model
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ImageModel)}
              className="rounded-lg border border-pine/15 bg-white px-2 py-1 text-sm dark:border-white/15 dark:bg-night/60"
            >
              <option value="gpt">ChatGPT image</option>
              <option value="nano">Nano Banana (cheaper)</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pine/20 px-6 py-8 text-center text-sm font-semibold text-pine hover:border-teal dark:border-white/20 dark:text-white">
          Choose file
          <span className="mt-1 text-xs font-normal text-stone dark:text-white/50">
            .docx, .md, .txt or .csv · you can pick several
          </span>
          <input
            type="file"
            multiple
            accept=".md,.markdown,.txt,.docx,.doc,.csv,text/markdown,text/plain,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </section>

      {/* Drafts */}
      {drafts.length > 0 && (
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-pine dark:text-white">
                2. Check posts, covers and times ({drafts.length})
              </h2>
              <p className="mt-1 text-sm text-stone dark:text-white/60">Times are in {timeZone}.</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewing(0)}
              className="neon-teal-btn rounded-full bg-pine px-5 py-2 text-sm font-semibold text-white hover:bg-teal dark:bg-teal"
            >
              Preview all posts
            </button>
          </div>

          <details className="mt-4 rounded-xl border border-pine/10 p-3 dark:border-white/10">
            <summary className="cursor-pointer text-sm font-semibold text-pine dark:text-white">
              Set times for posts without one
            </summary>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <p className={LABEL}>First post at</p>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={FIELD} />
              </div>
              <div>
                <p className={LABEL}>Then every</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={everyDays}
                    onChange={(e) => setEveryDays(Number(e.target.value))}
                    className={`${FIELD} w-20`}
                  />
                  <span className="mt-1 text-sm text-pine dark:text-white">days</span>
                </div>
              </div>
              <button type="button" onClick={() => fillTimes(true)} className={SMALL_BUTTON}>
                Fill empty times
              </button>
              <button type="button" onClick={() => fillTimes(false)} className={SMALL_BUTTON}>
                Re-time all
              </button>
            </div>
          </details>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {drafts.map((d, index) => (
              <div key={d.key} className="flex flex-col rounded-xl border border-pine/10 p-4 dark:border-white/10">
                <CoverBox
                  draft={d}
                  onGenerate={() => void generateCover(d.key)}
                  onUpload={(file) => void onOwnCover(d.key, file)}
                />
                <p className="mt-3 text-xs text-stone dark:text-white/50">
                  {index + 1}. From {d.source}
                </p>
                <p className={`${LABEL} mt-2`}>Title</p>
                <input value={d.title} onChange={(e) => update(d.key, { title: e.target.value })} className={FIELD} />
                <p className={`${LABEL} mt-3`}>Goes live</p>
                <input
                  type="datetime-local"
                  value={d.when}
                  onChange={(e) => update(d.key, { when: e.target.value })}
                  className={`${FIELD} ${d.when ? "" : "border-amber-500"}`}
                />
                <p className={`${LABEL} mt-3`}>Author (empty = {site.defaultAuthor})</p>
                <input value={d.author} onChange={(e) => update(d.key, { author: e.target.value })} className={FIELD} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreviewing(index)} className={SMALL_BUTTON}>
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrafts((current) => current.filter((x) => x.key !== d.key));
                    }}
                    className={`${SMALL_BUTTON} text-red-600 dark:text-red-400`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scheduled */}
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="text-base font-semibold text-pine dark:text-white">Scheduled posts</h2>
        {scheduled === null ? (
          <p className="mt-3 text-sm text-stone dark:text-white/60">Loading…</p>
        ) : scheduled.length === 0 ? (
          <p className="mt-3 text-sm text-stone dark:text-white/60">Nothing scheduled yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-pine/10 dark:divide-white/10">
            {scheduled.map((post) => (
              <ScheduledRow
                key={post.slug}
                post={post}
                due={new Date(post.publishAt).getTime() <= loadedAt}
                busy={busy === post.slug}
                onAct={act}
              />
            ))}
          </ul>
        )}
      </section>

      {(drafts.length > 0 || notice || error) && (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-pine/10 bg-white/95 p-4 shadow-lg dark:border-white/10 dark:bg-night/95">
          {drafts.length > 0 && (
            <button
              type="button"
              onClick={() => void onSchedule()}
              disabled={saving || missing.length > 0 || working > 0}
              className="neon-teal-btn rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
            >
              {saving ? "Scheduling…" : `Schedule ${drafts.length} post${drafts.length === 1 ? "" : "s"}`}
            </button>
          )}
          {working > 0 && (
            <p className="text-sm text-pine dark:text-white">
              Making {working} cover{working === 1 ? "" : "s"}…
            </p>
          )}
          {missing.length > 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {missing.length} post{missing.length === 1 ? " needs" : "s need"} a title, text and time.
            </p>
          )}
          {notice && <p className="text-sm text-pine dark:text-white">{notice}</p>}
          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {previewing !== null && drafts[previewing] && (
        <PreviewWindow
          drafts={drafts}
          index={previewing}
          onIndex={setPreviewing}
          onClose={() => setPreviewing(null)}
          onChange={update}
          onGenerate={(key) => void generateCover(key)}
          onUpload={(key, file) => void onOwnCover(key, file)}
        />
      )}
    </div>
  );
}

function CoverBox({
  draft,
  onGenerate,
  onUpload,
}: {
  draft: Draft;
  onGenerate: () => void;
  onUpload: (file: File) => void;
}) {
  const { cover } = draft;
  const src = cover.status === "ready" ? cover.preview : draft.imageUrl || "";
  return (
    <div>
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl bg-pine/5 dark:bg-white/5">
        {cover.status === "working" ? (
          <p className="animate-pulse text-sm text-stone dark:text-white/60">Making cover…</p>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : cover.status === "error" ? (
          <p className="px-4 text-center text-xs text-red-600 dark:text-red-400">{cover.error}</p>
        ) : (
          <p className="px-4 text-center text-xs text-stone dark:text-white/60">
            No cover yet. Generate one, upload your own, or leave it and one is made when it publishes.
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" disabled={cover.status === "working"} onClick={onGenerate} className={SMALL_BUTTON}>
          {cover.status === "ready" || draft.imageUrl ? "Regenerate" : "Generate cover"}
        </button>
        <label className={`${SMALL_BUTTON} cursor-pointer`}>
          Upload my own
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            disabled={cover.status === "working"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = "";
            }}
          />
        </label>
        {cover.status === "ready" && (
          <span className="text-xs text-stone dark:text-white/50">Made with {cover.label}</span>
        )}
        {cover.status !== "ready" && draft.imageUrl && (
          <span className="text-xs text-stone dark:text-white/50">Image from your file</span>
        )}
      </div>
    </div>
  );
}

/** Renders Markdown the same way the blog does (remark → HTML), in the browser. */
function useMarkdown(markdown: string) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ unified }, remarkParse, remarkRehype, rehypeStringify] = await Promise.all([
        import("unified"),
        import("remark-parse"),
        import("remark-rehype"),
        import("rehype-stringify"),
      ]);
      const file = await unified()
        .use(remarkParse.default)
        .use(remarkRehype.default)
        .use(rehypeStringify.default)
        .process(markdown);
      if (!cancelled) setHtml(String(file));
    })();
    return () => {
      cancelled = true;
    };
  }, [markdown]);
  return html;
}

function PreviewWindow({
  drafts,
  index,
  onIndex,
  onClose,
  onChange,
  onGenerate,
  onUpload,
}: {
  drafts: Draft[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  onChange: (key: string, patch: Partial<Draft>) => void;
  onGenerate: (key: string) => void;
  onUpload: (key: string, file: File) => void;
}) {
  const draft = drafts[index];
  const html = useMarkdown(draft.body);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.target as HTMLElement).closest("input, textarea")) return;
      if (event.key === "ArrowRight" && index < drafts.length - 1) onIndex(index + 1);
      if (event.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, drafts.length, onClose, onIndex]);

  const when = draft.when ? formatWhen(new Date(draft.when).toISOString()) : "No time set";

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 p-2 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Post preview"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-night"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pine/10 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button type="button" disabled={index === 0} onClick={() => onIndex(index - 1)} className={SMALL_BUTTON}>
              ← Previous
            </button>
            <span className="text-sm text-stone dark:text-white/60">
              {index + 1} of {drafts.length}
            </span>
            <button
              type="button"
              disabled={index === drafts.length - 1}
              onClick={() => onIndex(index + 1)}
              className={SMALL_BUTTON}
            >
              Next →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEditing((e) => !e)} className={SMALL_BUTTON}>
              {editing ? "Done editing" : "Edit text"}
            </button>
            <button type="button" onClick={onClose} className={SMALL_BUTTON} aria-label="Close preview">
              Close ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-8">
          <CoverBox
            draft={draft}
            onGenerate={() => onGenerate(draft.key)}
            onUpload={(file) => onUpload(draft.key, file)}
          />
          {!draft.imageUrl && (
            <div className="mt-3">
              <p className={LABEL}>Image prompt (optional; used when you click Regenerate)</p>
              <input
                value={draft.imagePrompt}
                onChange={(e) => onChange(draft.key, { imagePrompt: e.target.value })}
                placeholder="Leave empty to write one from the post"
                className={FIELD}
              />
            </div>
          )}

          {editing ? (
            <div className="mt-6 space-y-3">
              <div>
                <p className={LABEL}>Title</p>
                <input value={draft.title} onChange={(e) => onChange(draft.key, { title: e.target.value })} className={FIELD} />
              </div>
              <div>
                <p className={LABEL}>Short description (shown on cards and Google)</p>
                <textarea
                  rows={2}
                  value={draft.excerpt}
                  onChange={(e) => onChange(draft.key, { excerpt: e.target.value })}
                  className={FIELD}
                />
              </div>
              <div>
                <p className={LABEL}>Post text (Markdown)</p>
                <textarea
                  rows={18}
                  value={draft.body}
                  onChange={(e) => onChange(draft.key, { body: e.target.value })}
                  className={`${FIELD} font-mono text-xs`}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-teal">
                Goes live {when} · {draft.author || site.defaultAuthor}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-pine dark:text-white">{draft.title || "Untitled"}</h1>
              <p className="mt-3 text-base text-stone dark:text-white/70">{draft.excerpt}</p>
              <article
                className="prose mt-6 max-w-none prose-headings:font-semibold prose-headings:text-pine prose-p:leading-relaxed prose-p:text-stone prose-strong:text-pine prose-li:text-stone dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white/70 dark:prose-strong:text-white dark:prose-li:text-white/70"
                // Rendered from the admin's own file with raw HTML disallowed, as on the blog.
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduledRow({
  post,
  due,
  busy,
  onAct,
}: {
  post: Scheduled;
  due: boolean;
  busy: boolean;
  onAct: (slug: string, action: "now" | "cancel" | { at: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [at, setAt] = useState(() => {
    const date = new Date(post.publishAt);
    return Number.isNaN(date.getTime()) ? "" : toLocalInput(date);
  });

  return (
    <li className="flex flex-wrap items-center gap-4 py-3">
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="h-14 w-24 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-pine/20 px-1 text-center text-[10px] leading-tight text-stone dark:border-white/20 dark:text-white/50">
          {post.coverTries >= 2 ? "Default cover" : post.imageUrl ? "Image from link" : "Cover coming"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-pine dark:text-white">{post.title}</p>
        <p className="text-sm text-stone dark:text-white/60">
          {due ? "Publishing within 10 minutes" : formatWhen(post.publishAt)}
        </p>
        {editing && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className={`${FIELD} mt-0 w-auto`} />
            <button
              type="button"
              disabled={!at || busy}
              onClick={() => void onAct(post.slug, { at }).then(() => setEditing(false))}
              className={SMALL_BUTTON}
            >
              Save time
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => setEditing((e) => !e)} className={SMALL_BUTTON}>
          Change time
        </button>
        <button type="button" disabled={busy || due} onClick={() => void onAct(post.slug, "now")} className={SMALL_BUTTON}>
          Publish now
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onAct(post.slug, "cancel")}
          className={`${SMALL_BUTTON} text-red-600 dark:text-red-400`}
        >
          Cancel
        </button>
      </div>
    </li>
  );
}
