"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { uploadImage } from "./image-upload";
import { postsFromFile, toLocalInput, type DraftPost } from "./import-posts";

/**
 * Bulk scheduling: upload files, check the posts, give each a time, schedule.
 *
 * Scheduled posts wait in content/scheduled/. The "Scheduled posts" GitHub
 * workflow runs every ten minutes: it makes a cover for any post without one
 * (ChatGPT image on Kie, no approval step) and publishes each post once its
 * time has passed.
 */

type Scheduled = {
  slug: string;
  title: string;
  publishAt: string;
  cover: string;
  imageUrl: string;
  coverTries: number;
};

type Draft = DraftPost & { cover: string; uploading: boolean };

const FIELD =
  "mt-1 w-full rounded-xl border border-pine/15 bg-white px-3 py-2 text-sm text-pine outline-none focus:border-teal dark:border-white/15 dark:bg-night/60 dark:text-white";
const SMALL_BUTTON =
  "rounded-full border border-pine/15 px-3 py-1.5 text-xs font-semibold text-pine hover:border-teal disabled:opacity-40 dark:border-white/15 dark:text-white";
const LABEL = "text-xs font-semibold uppercase tracking-wide text-stone dark:text-white/50";

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
  // "Fill times" helper: first post at `start`, then one every `everyDays`.
  const [start, setStart] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return toLocalInput(tomorrow);
  });
  const [everyDays, setEveryDays] = useState(1);

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
        added.push(...posts.map((post) => ({ ...post, cover: "", uploading: false })));
      } catch (fileError) {
        problems.push((fileError as Error).message);
      }
    }
    setDrafts((current) => [...current, ...added]);
    if (problems.length) setError(problems.join(" "));
    if (added.length) {
      setNotice(
        `Added ${added.length} post${added.length === 1 ? "" : "s"}. Check them below, set the times, then click Schedule.`
      );
    }
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

  async function onCover(key: string, file: File | undefined) {
    if (!file) return;
    update(key, { uploading: true });
    try {
      const path = await uploadImage(file);
      update(key, { cover: path, imageUrl: "", uploading: false });
    } catch (uploadError) {
      update(key, { uploading: false });
      setError((uploadError as Error).message);
    }
  }

  const missing = drafts.filter((d) => !d.title.trim() || !d.body.trim() || !d.when);

  async function onSchedule() {
    if (drafts.length === 0 || missing.length > 0) return;
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
            cover: d.cover,
            imageUrl: d.cover ? "" : d.imageUrl,
            imagePrompt: d.imagePrompt,
            publishAt: new Date(d.when).toISOString(),
            date: d.when.slice(0, 10),
            tone: "teal",
          })),
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
      setNotice(
        `Scheduled ${count} post${count === 1 ? "" : "s"}. Covers for posts without an image are made within about 10 minutes; each post goes live at its time.`
      );
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
        <h2 className="text-base font-semibold text-pine dark:text-white">1. Add posts from files</h2>
        <p className="mt-1 text-sm text-stone dark:text-white/60">
          Upload <b>.md</b>, <b>.txt</b>, <b>.docx</b> or <b>.csv</b> files. A Word or Markdown file with several
          “Title” headings becomes several posts. A CSV needs <b>title</b> and <b>body</b> columns, and can also
          have <b>date</b>, <b>time</b>, <b>excerpt</b>, <b>author</b>, <b>image</b> (a link) and{" "}
          <b>image_prompt</b>.
        </p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pine/20 px-6 py-8 text-center text-sm font-semibold text-pine hover:border-teal dark:border-white/20 dark:text-white">
          Choose files
          <span className="mt-1 text-xs font-normal text-stone dark:text-white/50">You can pick several at once</span>
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
                2. Check posts and set times ({drafts.length})
              </h2>
              <p className="mt-1 text-sm text-stone dark:text-white/60">Times are in {timeZone}.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <p className={LABEL}>First post at</p>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <p className={LABEL}>Then every</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={everyDays}
                    onChange={(event) => setEveryDays(Number(event.target.value))}
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
          </div>

          <div className="mt-5 space-y-4">
            {drafts.map((d, index) => (
              <div key={d.key} className="rounded-xl border border-pine/10 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs text-stone dark:text-white/50">
                    {index + 1}. From {d.source}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDrafts((current) => current.filter((x) => x.key !== d.key))}
                    className={`${SMALL_BUTTON} text-red-600 dark:text-red-400`}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-3 md:grid-cols-[1fr_220px]">
                  <div>
                    <p className={LABEL}>Title</p>
                    <input value={d.title} onChange={(e) => update(d.key, { title: e.target.value })} className={FIELD} />
                  </div>
                  <div>
                    <p className={LABEL}>Goes live</p>
                    <input
                      type="datetime-local"
                      value={d.when}
                      onChange={(e) => update(d.key, { when: e.target.value })}
                      className={`${FIELD} ${d.when ? "" : "border-amber-500"}`}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={LABEL}>Short description (shown on cards and Google)</p>
                  <textarea
                    value={d.excerpt}
                    rows={2}
                    onChange={(e) => update(d.key, { excerpt: e.target.value })}
                    className={FIELD}
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className={LABEL}>Author (empty = {site.defaultAuthor})</p>
                    <input value={d.author} onChange={(e) => update(d.key, { author: e.target.value })} className={FIELD} />
                  </div>
                  <div>
                    <p className={LABEL}>Cover image</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {d.cover ? (
                        <span className="text-sm text-pine dark:text-white">Uploaded ✓</span>
                      ) : d.imageUrl ? (
                        <span className="truncate text-sm text-pine dark:text-white" title={d.imageUrl}>
                          From link in file
                        </span>
                      ) : (
                        <span className="text-sm text-stone dark:text-white/60">Made automatically</span>
                      )}
                      <label className={`${SMALL_BUTTON} cursor-pointer`}>
                        {d.uploading ? "Uploading…" : d.cover ? "Replace" : "Upload my own"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="sr-only"
                          disabled={d.uploading}
                          onChange={(event) => {
                            void onCover(d.key, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {!d.cover && !d.imageUrl && (
                  <div className="mt-3">
                    <p className={LABEL}>Image prompt (optional, otherwise written from the post)</p>
                    <input
                      value={d.imagePrompt}
                      onChange={(e) => update(d.key, { imagePrompt: e.target.value })}
                      className={FIELD}
                    />
                  </div>
                )}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-teal">
                    Post text ({d.body.split(/\s+/).filter(Boolean).length} words)
                  </summary>
                  <textarea
                    value={d.body}
                    rows={10}
                    onChange={(e) => update(d.key, { body: e.target.value })}
                    className={`${FIELD} font-mono text-xs`}
                  />
                </details>
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
              disabled={saving || missing.length > 0 || drafts.some((d) => d.uploading)}
              className="neon-teal-btn rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
            >
              {saving ? "Scheduling…" : `Schedule ${drafts.length} post${drafts.length === 1 ? "" : "s"}`}
            </button>
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
