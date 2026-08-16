# Sublime+ Landing Page

Preliminary marketing landing page for Sublime+ ("Content & social marketing, done with a little extra"), built with Next.js, Tailwind CSS, and Framer Motion, following the Sublime+ brand identity guidelines (teal/pine/lime palette, Poppins type, plus-mark motif).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/page.tsx` — landing page sections (Hero, Services, UGC, How it Works, Differentiators, Plans, Blog preview, Final CTA)
- `src/app/blog/` — blog index and post template (MDX-based)
- `content/blog/*.mdx` — blog posts, edit or add files here
- `src/components/sections/` — one component per landing page section
- `src/components/mascot/` — hero mascot with cursor-tracking face (see `design/README.md`)
- `src/components/booking/` — booking modal and its context provider
- `src/app/globals.css` — brand color tokens and duotone treatment
- `design/` — original mascot artwork; not served by the site

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to the production origin. It drives canonical URLs,
Open Graph image resolution, `sitemap.xml` and `robots.txt`. Without it, those
fall back to a placeholder and social previews will not resolve correctly.

```bash
NEXT_PUBLIC_SITE_URL=https://sublimeplus.co
```

## Content standards

Every claim on the site must trace to a Sublime+ SOP or a signed-off business
fact. Do not add testimonials, statistics, client names or capability claims
without a written source — see the QA/QC audit for the provenance rules and the
outstanding items.

## Known gaps

- **Copy requires owner sign-off.** The Services list, plan tiers and deliverable
  volumes, reporting cadence, and the stated consult duration are not currently
  traceable to any SOP. They need confirming or rewriting before launch.
- Logo is a code-recreated wordmark + plus mark (Poppins + SVG) rather than the
  original hand-lettered files. Swap in the real logo under `public/` and update
  `src/components/PlusMark.tsx` when available.
- The Differentiators background and blog covers use placeholder stock photos
  hot-linked from Unsplash. Self-host and replace with real imagery.
- The booking form is a simulated client-side submission. No backend is wired up.
