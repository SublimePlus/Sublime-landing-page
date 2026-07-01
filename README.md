# Sublime+ Landing Page

Preliminary marketing landing page for Sublime+ ("Content & social marketing, done with a little extra"), built with Next.js, Tailwind CSS, and Framer Motion, following the Sublime+ brand identity guidelines (teal/pine/lime palette, Poppins type, plus-mark motif).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/page.tsx` — landing page sections (Hero, Services, How it Works, Differentiators, Testimonials, Blog preview, Final CTA)
- `src/app/blog/` — blog index and post template (MDX-based)
- `content/blog/*.mdx` — blog posts, edit or add files here
- `src/components/` — shared UI and section components
- `src/app/globals.css` — brand color tokens and duotone treatment

## Notes

- Logo is a code-recreated wordmark + plus mark (teal/lime, Poppins) since the original hand-lettered logo files live in the Sublime+ Canva brand kit and couldn't be exported as binary assets in this environment. Swap in the real logo SVG/PNG under `public/` and update `src/components/PlusMark.tsx` once available.
- Imagery uses placeholder stock photos with a CSS duotone filter approximating the brand's teal/pine photography treatment — replace with real photography when available.
- All copy is placeholder/launch-draft quality, written to match brand voice, and should be reviewed before shipping.
