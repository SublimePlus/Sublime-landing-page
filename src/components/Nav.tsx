"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./PlusMark";
import { BookMeetingButton } from "./booking/BookMeetingButton";
import { ThemeToggle } from "./theme/ThemeToggle";

const links = [
  { href: "/#services", label: "Services", id: "services" },
  { href: "/#ugc", label: "UGC", id: "ugc" },
  { href: "/#plans", label: "Plans", id: "plans" },
  { href: "/#faq", label: "FAQ", id: "faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const activeId = useActiveSection(pathname === "/");

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
        scrolled
          ? "bg-white/85 backdrop-blur-md shadow-sm dark:bg-night/85"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Sublime+ home">
          <Logo variant={scrolled ? "dark" : "light"} />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative text-sm font-medium transition-colors hover:text-lime ${
                scrolled ? "text-pine/80 dark:text-white/80" : "text-white/85"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-lime transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                  link.id && link.id === activeId ? "scale-x-100" : ""
                }`}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle scrolled={scrolled} />
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
