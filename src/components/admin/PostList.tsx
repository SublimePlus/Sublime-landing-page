"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPostDate } from "@/lib/blog";

type Row = {
  slug: string;
  title: string;
  date: string;
  author: string;
  cover: string;
  archived: boolean;
};

type View = "list" | "grid";
const VIEW_KEY = "sublime-admin-post-view";

/** Unauthorised is signalled rather than thrown: it means "re-render the gate". */
type FetchResult =
  | { kind: "ok"; posts: Row[] }
  | { kind: "unauthorised" }
  | { kind: "error"; message: string };

/**
 * Pure fetch, no state. Keeping it outside the component is what lets the
 * effect below await it before touching state, rather than calling a function
 * that sets state synchronously inside the effect body.
 */
async function fetchPosts(): Promise<FetchResult> {
  try {
    const response = await fetch("/api/admin/posts", { cache: "no-store" });
    if (response.status === 401) return { kind: "unauthorised" };

    const data = (await response.json().catch(() => ({}))) as {
      posts?: Row[];
      error?: string;
    };
    if (!response.ok) {
      return { kind: "error", message: data.error ?? "Could not load posts." };
    }
    return { kind: "ok", posts: data.posts ?? [] };
  } catch {
    return { kind: "error", message: "Could not reach the server." };
  }
}

export function PostList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The slug a row action (delete, archive) is running for.
  const [busy, setBusy] = useState<string | null>(null);
  // Moving rows is local until "Save order"; this is the list as last loaded.
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // List shows the re-order arrows; grid shows covers. Remembered per browser.
  // Read lazily on the client: the first render is "Loading posts…", which
  // does not depend on the view, so server and client markup still match.
  const [view, setView] = useState<View>(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(VIEW_KEY) === "grid"
        ? "grid"
        : "list";
    } catch {
      return "list";
    }
  });

  function chooseView(next: View) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Not remembered; the choice still applies now.
    }
  }
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchPosts();
      if (cancelled) return;

      if (result.kind === "unauthorised") {
        router.refresh();
        return;
      }
      if (result.kind === "error") {
        setError(result.message);
        return;
      }
      setError(null);
      setPosts(result.posts);
      setSavedOrder(result.posts.map((post) => post.slug));
    })();

    return () => {
      cancelled = true;
    };
  }, [router, reloadToken]);

  /** Bumping the token re-runs the effect; nothing else re-fetches. */
  const reload = () => setReloadToken((token) => token + 1);

  const orderChanged =
    posts !== null && posts.map((post) => post.slug).join() !== savedOrder.join();

  function move(index: number, by: -1 | 1) {
    setNotice(null);
    setPosts((current) => {
      if (!current) return current;
      const target = index + by;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSaveOrder() {
    if (!posts) return;
    setSavingOrder(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: posts.map((post) => post.slug) }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not save the order.");
        return;
      }
      setSavedOrder(posts.map((post) => post.slug));
      setNotice("Order saved. The site updates once the deploy finishes, usually a minute or two.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSavingOrder(false);
    }
  }

  async function onArchive(slug: string, archived: boolean) {
    setBusy(slug);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not update the post.");
        return;
      }
      setNotice(
        archived
          ? "Archived. It disappears from the site after the deploy; restore it any time."
          : "Restored. It reappears on the site after the deploy."
      );
      reload();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(slug: string, title: string) {
    if (
      !window.confirm(
        `Delete "${title}" permanently? To hide it without losing it, use Archive instead.`
      )
    ) {
      return;
    }

    setBusy(slug);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not delete the post.");
        return;
      }
      reload();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => {
            setError(null);
            reload();
          }}
          className="mt-3 text-sm font-semibold text-teal-ink underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts === null) {
    return <p className="text-sm text-stone dark:text-white/60">Loading posts…</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-stone dark:text-white/60">
        No posts yet. Write the first one.
      </p>
    );
  }

  const ROW_BUTTON =
    "rounded-full border border-pine/15 px-4 py-2 text-sm font-semibold text-pine hover:border-teal disabled:opacity-50 dark:border-white/15 dark:text-white";
  const ARROW =
    "flex h-8 w-8 items-center justify-center rounded-full border border-pine/15 text-pine hover:border-teal disabled:opacity-30 dark:border-white/15 dark:text-white";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-pine/15 p-1 dark:border-white/15">
            {(["list", "grid"] as const).map((option) => (
              <button
                key={option}
                onClick={() => chooseView(option)}
                aria-pressed={view === option}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                  view === option
                    ? "bg-pine text-white dark:bg-teal"
                    : "text-pine hover:text-teal-ink dark:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-sm text-stone dark:text-white/60">
            {view === "list"
              ? "Use ↑ ↓ to set the order posts appear in on the site, then save."
              : "Switch to List to change the order."}
          </p>
        </div>
        {orderChanged && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => reload()}
              disabled={savingOrder}
              className={ROW_BUTTON}
            >
              Undo
            </button>
            <button
              onClick={() => void onSaveOrder()}
              disabled={savingOrder}
              className="neon-teal-btn rounded-full bg-pine px-5 py-2 text-sm font-semibold text-white hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
            >
              {savingOrder ? "Saving…" : "Save order"}
            </button>
          </div>
        )}
      </div>

      {notice && (
        <p className="rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-pine dark:text-white">
          {notice}
        </p>
      )}

      {view === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className={`glass-panel flex flex-col overflow-hidden rounded-2xl ${
                post.archived ? "opacity-60" : ""
              }`}
            >
              <div className="relative aspect-[16/10] bg-gradient-to-br from-pine via-teal to-teal-dark">
                {post.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {post.archived && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-pine">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium text-stone dark:text-white/50">
                  {post.date ? formatPostDate(post.date) : "No date"}
                  {post.author && <> · {post.author}</>}
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-pine dark:text-white">
                  {post.title || post.slug}
                </h2>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link href={`/admin/edit/${post.slug}`} className={ROW_BUTTON}>
                    Edit
                  </Link>
                  <button
                    onClick={() => void onArchive(post.slug, !post.archived)}
                    disabled={busy === post.slug}
                    className={ROW_BUTTON}
                  >
                    {post.archived ? "Restore" : "Archive"}
                  </button>
                  <button
                    onClick={() => void onDelete(post.slug, post.title || post.slug)}
                    disabled={busy === post.slug}
                    className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-500 disabled:opacity-50 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
      <ul className="space-y-3">
        {posts.map((post, index) => (
          <li
            key={post.slug}
            className={`glass-panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between ${
              post.archived ? "opacity-60" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || savingOrder}
                  aria-label={`Move "${post.title || post.slug}" up`}
                  className={ARROW}
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === posts.length - 1 || savingOrder}
                  aria-label={`Move "${post.title || post.slug}" down`}
                  className={ARROW}
                >
                  ↓
                </button>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone dark:text-white/50">
                  {post.date ? formatPostDate(post.date) : "No date"} · /blog/{post.slug}
                  {post.author && <> · {post.author}</>}
                </p>
                <h2 className="mt-1 truncate text-base font-semibold text-pine dark:text-white">
                  {post.archived && (
                    <span className="mr-2 rounded-full bg-amber-500/20 px-2 py-0.5 align-middle text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Archived
                    </span>
                  )}
                  {post.title || post.slug}
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link href={`/admin/edit/${post.slug}`} className={ROW_BUTTON}>
                Edit
              </Link>
              <button
                onClick={() => void onArchive(post.slug, !post.archived)}
                disabled={busy === post.slug}
                className={ROW_BUTTON}
              >
                {post.archived ? "Restore" : "Archive"}
              </button>
              <button
                onClick={() => void onDelete(post.slug, post.title || post.slug)}
                disabled={busy === post.slug}
                className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-500 disabled:opacity-50 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
