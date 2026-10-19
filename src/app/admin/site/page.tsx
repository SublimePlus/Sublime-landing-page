import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/admin/auth";
import { BackLink } from "@/components/admin/BackLink";
import { SiteEditor } from "@/components/admin/SiteEditor";

export const dynamic = "force-dynamic";

export default async function SiteEditorPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  return (
    <>
      <BackLink />
      <h1 className="text-2xl font-bold text-pine dark:text-white">Edit website</h1>
      <p className="mb-8 mt-1 text-sm text-stone dark:text-white/60">
        Change the text, plans, prices, FAQ and images on the main site. Saving publishes it;
        the site updates once the deploy finishes, usually a minute or two.
      </p>
      <SiteEditor />
    </>
  );
}
