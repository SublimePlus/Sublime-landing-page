"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./PlusMark";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#how-it-works", label: "How it Works" },
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
        scrolled ? "bg-white/85 backdrop-blur-md shadow-sm" : "bg-transparent"
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
                scrolled ? "text-pine/80" : "text-white/85"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/#contact"
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal"
        >
          Book a Call
        </Link>
      </nav>
    </header>
  );
}
