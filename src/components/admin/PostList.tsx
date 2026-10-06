"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPostDate } from "@/lib/blog";

type Row = { slug: string; title: string; excerpt: string; date: string };

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
  const [deleting, setDeleting] = useState<string | null>(null);
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
    })();

    return () => {
      cancelled = true;
    };
  }, [router, reloadToken]);

  /** Bumping the token re-runs the effect; nothing else re-fetches. */
  const reload = () => setReloadToken((token) => token + 1);

  async function onDelete(slug: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This commits the deletion to the repository.`)) {
      return;
    }

    setDeleting(slug);
    setError(null);
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
      setDeleting(null);
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

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="glass-panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-stone dark:text-white/50">
              {post.date ? formatPostDate(post.date) : "No date"} · /blog/{post.slug}
            </p>
            <h2 className="mt-1 truncate text-base font-semibold text-pine dark:text-white">
              {post.title || post.slug}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/edit/${post.slug}`}
              className="rounded-full border border-pine/15 px-4 py-2 text-sm font-semibold text-pine hover:border-teal dark:border-white/15 dark:text-white"
            >
              Edit
            </Link>
            <button
              onClick={() => void onDelete(post.slug, post.title || post.slug)}
              disabled={deleting === post.slug}
              className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-500 disabled:opacity-50 dark:text-red-400"
            >
              {deleting === post.slug ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
