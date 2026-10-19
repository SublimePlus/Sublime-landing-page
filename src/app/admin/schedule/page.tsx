import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/admin/auth";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  if (!(await isLoggedIn())) redirect("/admin");

  return (
    <>
      <h1 className="text-2xl font-bold text-pine dark:text-white">Schedule posts</h1>
      <p className="mb-8 mt-1 text-sm text-stone dark:text-white/60">
        Upload your posts, give each one a date and time, and they go live on their own. Posts without
        an image get a cover made automatically.
      </p>
      <ScheduleManager />
    </>
  );
}
