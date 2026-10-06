import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/admin/auth";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin");

  const { slug } = await params;

  return (
    <>
      <h1 className="text-2xl font-bold text-pine dark:text-white">Edit post</h1>
      <p className="mb-8 mt-1 font-mono text-sm text-stone dark:text-white/60">
        /blog/{slug}
      </p>
      <PostEditor slug={slug} />
    </>
  );
}
