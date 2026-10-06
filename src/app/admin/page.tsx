import Link from "next/link";
import { isAdminConfigured, isLoggedIn } from "@/lib/admin/auth";
import { isPublishingConfigured } from "@/lib/admin/github";
import { LoginForm } from "@/components/admin/LoginForm";
import { PostList } from "@/components/admin/PostList";
import { SignOutButton } from "@/components/admin/SignOutButton";

/**
 * Reads the session cookie, so it can never be prerendered — and must not be,
 * or the login gate would be baked in at build time.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isLoggedIn())) {
    return <LoginForm configured={isAdminConfigured()} />;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pine dark:text-white">Blog admin</h1>
          <p className="mt-1 text-sm text-stone dark:text-white/60">
            Posts are committed to the repository; each save triggers a deploy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/new"
            className="neon-teal-btn rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal dark:bg-teal dark:hover:bg-teal-dark"
          >
            New post
          </Link>
          <SignOutButton />
        </div>
      </div>

      {!isPublishingConfigured() && (
        <p className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-pine dark:text-white">
          Publishing is not configured on this deployment. Set the{" "}
          <code className="font-mono">GITHUB_TOKEN</code> and{" "}
          <code className="font-mono">GITHUB_REPO</code> secrets to load and save posts.
        </p>
      )}

      <div className="mt-8">
        <PostList />
      </div>
    </>
  );
}
