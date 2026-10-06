import type { Metadata } from "next";

/**
 * The admin area is deliberately plain: no hero, no decorative background
 * layers, just forms. It does still sit inside the root layout, so the site
 * nav and footer wrap it — kept on purpose, as the way back to the live site
 * and to the theme toggle, rather than rebuilding both for the editor.
 */
export const metadata: Metadata = {
  title: "Blog admin",
  // Belt and braces alongside the Disallow in robots.ts.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">{children}</div>;
}
