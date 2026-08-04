"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./PlusMark";
import { BookMeetingButton } from "./booking/BookMeetingButton";
import { ThemeToggle } from "./theme/ThemeToggle";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#ugc", label: "UGC" },
  { href: "/#plans", label: "Plans" },
  { href: "/blog", label: "Blog" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
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
              className={`text-sm font-medium transition-colors hover:text-lime ${
                scrolled ? "text-pine/80 dark:text-white/80" : "text-white/85"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle scrolled={scrolled} />
          <BookMeetingButton className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal dark:bg-teal dark:hover:bg-teal-dark">
            Book a Call
          </BookMeetingButton>
        </div>
      </nav>
    </header>
  );
}
