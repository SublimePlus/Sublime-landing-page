"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./PlusMark";
import { BookMeetingButton } from "./booking/BookMeetingButton";
import { ThemeToggle } from "./theme/ThemeToggle";

/**
 * `id` ties a link to a homepage section for the scroll-spy underline. Blog is
 * a route rather than a section, so it carries no id and is highlighted from
 * the pathname instead.
 */
const links: { href: string; label: string; id: string | null }[] = [
  { href: "/#services", label: "Services", id: "services" },
  { href: "/#ugc", label: "UGC", id: "ugc" },
  { href: "/#plans", label: "Plans", id: "plans" },
  { href: "/#faq", label: "FAQ", id: "faq" },
  { href: "/blog", label: "Blogs", id: null },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const activeId = useActiveSection(onHome);

  /**
   * The transparent nav only works over the homepage's dark hero — white
   * wordmark and links on pine. Every other route (the blog) opens on the
   * light page background, where that same nav is white on white. So anywhere
   * but home it starts in its solid state rather than waiting for a scroll.
   */
  const solid = scrolled || !onHome;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 z-40 w-full transition-colors duration-300 ${
        solid
          ? "bg-white/85 backdrop-blur-md shadow-sm dark:bg-night/85"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Sublime Plus home">
          <Logo variant={solid ? "dark" : "light"} />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = link.id
              ? link.id === activeId
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative text-sm font-medium transition-colors hover:text-lime ${
                  solid ? "text-pine/80 dark:text-white/80" : "text-white/85"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-lime transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                    active ? "scale-x-100" : ""
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle scrolled={solid} />
          <BookMeetingButton className="neon-teal-btn rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal dark:bg-teal dark:hover:bg-teal-dark">
            Book a Call
          </BookMeetingButton>
        </div>
      </nav>
    </motion.header>
  );
}

function useActiveSection(enabled: boolean) {
  const [rawActiveId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const ids = links.map((l) => l.id).filter((id): id is string => !!id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? rawActiveId : null;
}
