import Link from "next/link";
import { Logo } from "./PlusMark";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pine text-white/80">
      <PlusTexture />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo variant="light" />
            <p className="mt-4 text-sm text-white/60">
              Content &amp; social marketing, done with a little extra.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold text-white">Company</p>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/#services" className="hover:text-lime">Services</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-lime">How it Works</Link></li>
                <li><Link href="/blog" className="hover:text-lime">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-white">Connect</p>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-lime">Instagram</a></li>
                <li><a href="#" className="hover:text-lime">LinkedIn</a></li>
                <li><a href="#" className="hover:text-lime">X / Twitter</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-white">Get in touch</p>
              <ul className="space-y-2 text-white/60">
                <li><a href="mailto:hello@sublimeplus.co" className="hover:text-lime">hello@sublimeplus.co</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Sublime+. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function PlusTexture() {
  const marks = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
      {marks.map((_, i) => (
        <span
          key={i}
          className="absolute text-2xl font-bold text-lime"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            transform: `rotate(${(i * 17) % 45}deg)`,
          }}
        >
          +
        </span>
      ))}
    </div>
  );
}
