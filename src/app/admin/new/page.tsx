import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/admin/auth";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  return (
    <>
      <h1 className="text-2xl font-bold text-pine dark:text-white">New post</h1>
      <p className="mb-8 mt-1 text-sm text-stone dark:text-white/60">
        Publishing commits a Markdown file to the repository.
      </p>
      <PostEditor />
    </>
  );
}
