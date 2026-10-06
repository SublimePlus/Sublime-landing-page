# Sublime Plus Landing Page

Preliminary marketing landing page for Sublime Plus ("Content & social marketing, done with a little extra"), built with Next.js, Tailwind CSS, and Framer Motion, following the Sublime Plus brand identity guidelines (teal/pine/lime palette, Poppins type, plus-mark motif).

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
NEXT_PUBLIC_SITE_URL=https://sublime-plus.com
```

## Blog admin (`/admin`)

`/admin` is a password-protected editor for the blog. It does not use a
database: saving a post commits a Markdown file to `content/blog/` in this
repository through the GitHub API, which triggers a deploy. A post is live once
that deploy finishes — usually a minute or two, not instantly.

That is a deliberate trade. Posts keep their git history and stay reviewable,
the site keeps compiling them at build time, and there is no runtime datastore
to run or pay for.

### Setup

Two **secrets** to set on the deployment — never in the repository:

| Secret | What it is |
| --- | --- |
| `ADMIN_PASSWORD` | The password for `/admin`. Without it the editor refuses to sign anyone in. |
| `GITHUB_TOKEN` | A fine-grained personal access token created by the account that owns the repo, scoped to **this repository only**, with **Contents: Read and write**. Nothing else. |

Set them with `npx wrangler secret put ADMIN_PASSWORD` (and `GITHUB_TOKEN`), or
in the Cloudflare dashboard under the Worker's **Settings → Variables and
Secrets**, with the type set to **Secret**. Secrets survive redeploys, which
matters because every post saved from `/admin` triggers one.

The non-secret settings are already in `wrangler.jsonc` under `vars`:

| Variable | Value | Notes |
| --- | --- | --- |
| `GITHUB_REPO` | `SublimePlus/Sublime-landing-page` | The repository posts are committed to. |
| `GITHUB_BRANCH` | `main` | The branch posts are committed to, so they publish to the live site. |
| `ADMIN_SESSION_SECRET` | *(not set)* | Optional secret that signs the session cookie. Defaults to the password, so changing the password signs everyone out. |

For a local `opennextjs-cloudflare preview`, put the secrets in `.dev.vars` —
it is gitignored. `.env.example` lists every variable.

### Notes

- The editor writes Markdown, not MDX. HTML and JSX in a post body are escaped,
  not rendered.
- Posts are validated before anything is committed — a malformed post would
  otherwise fail the next build and stop the site deploying.
- Concurrent edits are rejected rather than merged: saving a post that changed
  since the editor loaded it returns an error asking you to reload.
- `/admin` and `/api/` are disallowed in `robots.txt` and marked `noindex`.
- The password is the only thing in front of the editor. Use a strong one, and
  rotate it by updating the secret.

## Content standards

Every claim on the site must trace to a Sublime Plus SOP or a signed-off business
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
- The Differentiators background uses placeholder stock photos hot-linked from
  Unsplash. Self-host and replace with real imagery. (Blog covers no longer do:
  they are generated brand gradients.)
- The booking form is a simulated client-side submission. No backend is wired up.
