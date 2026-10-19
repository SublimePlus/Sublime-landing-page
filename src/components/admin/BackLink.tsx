import Link from "next/link";

/** The "← Back" link at the top of every admin page. */
export function BackLink({ href = "/admin", label = "Back to admin" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-pine/15 px-4 py-1.5 text-sm font-semibold text-pine hover:border-teal dark:border-white/15 dark:text-white"
    >
      <span aria-hidden="true">←</span> {label}
    </Link>
  );
}
