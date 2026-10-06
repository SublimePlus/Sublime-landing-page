"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      onClick={async () => {
        setBusy(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      disabled={busy}
      className="rounded-full border border-pine/15 px-5 py-2.5 text-sm font-semibold text-pine hover:border-teal disabled:opacity-50 dark:border-white/15 dark:text-white"
    >
      Sign out
    </button>
  );
}
