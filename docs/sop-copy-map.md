# SOP → copy traceability map

Every claim made on the Sublime+ landing page traces to a clause in a Sublime+
standard operating procedure. This file is the map. It exists so that a copy
change can be checked against its source in one step, and so that anything
without a source is visible as such.

**Rule:** if a statement is not traceable to a row below, it does not ship.

## Source documents

| ID | Title | Notes |
| --- | --- | --- |
| SOP-001 | Client Onboarding v2 | |
| SOP-002 | Content Creation & Production v2 | |
| SOP-004 | Content Posting & Reddit Operations v2 | |
| SOP-007 | Ethical Guidelines & Content Standards v2 | |
| SOP-008 | Crisis Management & Escalation v2 | Sourced by the FAQ answer on post removal |
| SOP-009 | AI Usage Policy v2 | |
| SOP-010 | Team Meetings & Internal Communication v2 | Internal only — nothing on the page draws from it |
| SOP-S01 | Sales Process | Supersedes SOP-012, SOP-013 and SOP-014 |
| SOP-U01 | UGC Product Line: Delivery & Operations | |

SOP-012, SOP-013 and SOP-014 are explicitly replaced by SOP-S01 and are not
used as sources for site copy.

## Hero

| Copy | Source |
| --- | --- |
| "Content & social marketing, done with a little extra" | Brand guidelines (tagline). **Not SOP-sourced** — the only non-SOP string on the page, retained as established brand identity |
| "Be the brand AI recommends." | SOP-001 §5.5 (LLM perception is what we work on) and §4.1 (campaign shapes LLM perception). A goal statement, not a guarantee about any specific brand |
| "We plan, write and create content that shapes how AI describes you, and moves you up in search." | SOP-002 §4 (we plan, write and create content); SOP-001 §4.1 (improves SEO rankings and shapes LLM perception) |
| "Free 30–45 minute call. Nothing gets published without your approval." | SOP-S01 §10 (call length); SOP-002 §8.3 (approval gate) |
| "Book a discovery call" | SOP-S01 §6 — the "Call Booked" pipeline stage |
| "Book a call" (secondary CTA) | Opens the booking modal, like every CTA on the page. No claim |

## Services

| Card | Source |
| --- | --- |
| Reddit Posts, Comments & Replies | SOP-002 §4 — the three content types and what each is for |
| Blogs & Long-Form | SOP-009 §6.1 and SOP-001 §4.1 — blogs listed as a deliverable type |
| Content Planning | SOP-002 §5.1 — required contents of the content plan |
| Brand & Visibility Research | SOP-001 §5 — the five research steps, including the LLM perception check |
| Posting & Platform Compliance | SOP-004 §5–7 — natural posting, subreddit rules, CM verification, link logging |
| UGC Visual Content | SOP-U01 §4 — the four product lines |

**Removed in this pass:** "Community Engagement" (framed as comment and DM
management — no SOP describes a live community-management service; the
supportable part, replies, now sits inside card 1), "Growth Reporting" as a
standalone service, "Visual Direction" (duotone imagery and templates — no SOP
source).

## UGC

| Copy | Source |
| --- | --- |
| Faceless Content | SOP-U01 §4.1 — environments, flat lays, lifestyle, product-on-surface, hands-only, no face |
| AI Avatar Models | SOP-U01 §4.2 — not real people; client approval of the avatar; reuse for consistency |
| Brand Ambassadors | SOP-U01 §4.3 — Variant A likeness release mandatory before work starts; Variant B created from scratch |
| AI Influencers & Bloggers | SOP-U01 §4.4, §4.4.1 — sponsored posts, ~10 launch niches, AI disclosure in bio and post description |
| "Single images or carousels of 2–6 slides, in any standard aspect ratio" | SOP-U01 §5.2 |
| "Captions and on-image text included with every deliverable" | SOP-U01 §5.2, §14.3 |
| "Instagram, Reddit, Facebook, Pinterest, Etsy and TikTok" | SOP-U01 §5.1 |
| "First draft in under 5 working days from an approved brief" | SOP-U01 §11.6 |
| "2–3 revision rounds, revised content back within 1–2 business days" | SOP-U01 §13, §11.6 |
| "Nothing posts until you say yes" | SOP-U01 §11.4, §16 |
| "Every deliverable passes an internal quality review before you see it" | SOP-U01 §11.3 — Senior CM QA |

Niche list follows SOP-U01 §4.4.1 exactly. The previous copy said "beauty";
the SOP says "makeup".

### UGC carousel

Four slides, one per SOP-U01 §4 product line. The titles and one-line blurbs
live in `src/components/sections/Ugc.tsx` and feed
`src/components/ui/FeatureCarousel.tsx`.

Each slide shows a client-supplied example image from `public/showcase`, one
per line in order (faceless, AI avatar, ambassador, AI influencer). These are
the client's own chosen example assets, not stock passed off as delivered work,
so they do not run into the SOP-007 §4 / SOP-U01 §16 fabrication concern. A
slide with no `image` falls back to a branded panel.

## How it works

| Step | Source |
| --- | --- |
| 01 — research before the meeting | SOP-001 §5.1–5.6 — web research, social audit, review sites, SEO snapshot, LLM perception check, onboarding deck |
| 02 — 30–45 minute alignment call | SOP-001 §6.1 (Google Meet, 30–45 min), §6.2.3 (client confirms or corrects), §7.1 (client context document); SOP-002 §5.1–5.2 (content plan and Senior Manager approval) |
| 03 — approve, then post | SOP-001 §6.2.6 (2–4 business days to first deliverables, 7–10 to first content live); SOP-002 §8.3 (no posting before explicit approval) |
| "From first call to first post in 7–10 business days" | SOP-001 §6.2.6 |

## Removed: the commitments block

The five-point "things we put in writing" block (originally the standalone
Differentiators section, later merged into Services) has been removed from the
page by request.

The commitments themselves are unchanged as company policy, and four of the
five are still stated on the page through the FAQ: the single Customer Manager,
the LLM perception check, the written-approval gate, and the human review of
every AI draft. The fifth, the SOP-007 §4 prohibition on fabricated statistics
and testimonials, is stated in the "Can you guarantee results?" answer.

Sources, retained for reference: SOP-001 §6.2.1 and SOP-U01 §3; SOP-001 §5.5;
SOP-002 §8.3; SOP-009 §4 and §8; SOP-007 §4.

## Plans

| Copy | Source |
| --- | --- |
| Starter / Growth / Pro | SOP-S01 §10.5 — package names |
| 10 / 25 / 30 posts per month | SOP-S01 §10.5 |
| "Supporting comments included" | SOP-S01 §10.5 |
| "AI-generated, CM-reviewed" (Starter, Growth) | SOP-S01 §10.5 quality layer; SOP-009 §6.1 review requirement |
| "AI-generated plus human proofread" (Pro) | SOP-S01 §10.5 |
| "Billed monthly, upfront" | SOP-S01 §10.5, §12.1 |
| "no hidden costs and no ambiguity about what you are paying for" | SOP-S01 §10.4, §15 |
| Custom add-ons | SOP-S01 §10.5 |

**Removed in this pass:** the Lite / Pro / Max names and all per-tier blog
counts, platform counts and report cadences. None appear in any SOP.

Prices ($500 / $1,000 / $1,500 per month, SOP-S01 §10.5) are documented but
deliberately withheld from the page by decision, and presented on the call.

## Final CTA

| Copy | Source |
| --- | --- |
| "Could your business do more with better visibility?" | SOP-S01 §5.2 |
| "30–45 minute call on Google Meet" | SOP-S01 §10 |
| Call agenda — goals, how Reddit affects SEO and LLM perception, packages and prices | SOP-S01 §10.2–10.4 |

**Corrected in this pass:** the page previously offered a "free 20-minute
consult". SOP-S01 §10 sets the call at 30–45 minutes.

## FAQ

Answers live in `src/lib/faq.ts` and are rendered by
`src/components/sections/Faq.tsx`. The same array generates the FAQPage
structured data, so the visible answer and the machine-readable answer cannot
drift apart.

| Question | Source |
| --- | --- |
| How quickly will my first content go live? | SOP-001 §6.2.6 |
| Could you post something I haven't seen? | SOP-002 §8.3, §9.1; SOP-004 §4; SOP-U01 §16 |
| Do you use AI to write the content? | SOP-009 §4, §5, §6.1, §8 |
| Can you guarantee results? | SOP-U01 §16; SOP-S01 §15; SOP-007 §4 |
| How does billing work? | SOP-S01 §12.1 |

Trimmed from twelve to the five that decide a booking: when it goes live, who
controls what gets published, whether AI writes it, whether results are
promised, and how billing works. The seven that were cut (Customer Manager
ownership, what we need to start, revision rounds, platforms, post removal,
prohibited categories, AI disclosure) remain sourced and are still served to
machines through `public/llms.txt`, which is not competing for a visitor's
attention. FAQPage schema follows the five on the page, since Google requires
schema content to be visible.

Answers are written answer-first: the opening sentence must stand alone as a
complete claim, because that is the unit a language model lifts when citing a
page. Cancellation and refund terms are absent — SOP-007 §6.4 covers refunds
only for undelivered work after an ethics cancellation, which is not a general
cancellation policy and must not be presented as one.

## Structured data

| Schema | Source |
| --- | --- |
| Organization, WebSite | `src/lib/site.ts` description; sources as above |
| Service + OfferCatalog | SOP-S01 §10.5 (packages), §5.1 (audience segments) |
| FAQPage | Generated from `src/lib/faq.ts`; sources in the FAQ table above |
| BlogPosting, BreadcrumbList | Post front matter |

Offers deliberately carry no `price` property, and no Review or
AggregateRating is emitted anywhere.

## Plan comparison table

Rows come from SOP-S01 §10.5 and the approval and review rules in SOP-002 §8.3
and SOP-009 §6.1. Rows a comparison table would conventionally carry —
platforms covered, blog volume, reporting cadence, support tier — are absent
because that clause does not break them down by package.

## Blog

| Post | Source |
| --- | --- |
| What an LLM Perception Check Tells You About Your Brand | SOP-001 §5, §6.2, §7.1, §8 |
| Nothing We Write Goes Live Without Your Written Approval | SOP-002 §5–10; SOP-004 §5–7 |
| How We Use AI — And Where a Human Always Steps In | SOP-009 in full; SOP-007 §4; SOP-U01 §4.4 |

**Removed in this pass:** all three previous posts. "Why a Consistent Posting
Schedule Beats Viral Luck" asserted a monthly-arc planning method with no SOP
source; "How to Build a Brand Voice…" described sitting with founders, reading
support tickets and listening to sales calls, which is not the documented
onboarding process; "The Only 4 Social Metrics That Actually Matter" asserted a
four-metric monthly report that no SOP defines. SOP-U01 §12.2 and §15.1 list
views, likes, comments and engagement as the metrics actually tracked.

## Site-wide

| Copy | Source |
| --- | --- |
| Meta description, Organization and WebSite schema description | SOP-S01 §5.2; SOP-002 §4; SOP-U01 §4 |
| `public/llms.txt` | Every section annotated inline; sources as above |

## Known gaps

These are absent from the page because no SOP supports them. Adding any of
them requires an SOP update first, not a copy decision.

- **Client-facing reporting cadence for the Reddit service.** SOP-U01 §12
  defines Monday and Friday reports plus a bi-monthly or monthly strategy
  meeting, but that section governs UGC clients. No SOP states a cadence for
  the Starter/Growth/Pro packages, so the page states none.
- **Testimonials, client names, case studies and performance figures.** SOP-007
  §4 and SOP-S01 §15 prohibit fabricating any of these; none exist yet.
- **Social profile links.** No real profiles to link to.
- **Cancellation and refund terms.** SOP-007 §6.4 covers refunds only for
  undelivered work following an ethics cancellation. No general cancellation
  policy is documented, so the page states none.
- **Per-tier platform coverage.** SOP-S01 §10.5 does not break platforms down
  by package.

## House style

- **No em dashes.** Copy uses commas, colons or full stops instead. En dashes
  are retained in numeric ranges (2–4 business days, 30–45 minutes, 7–10 days)
  because those are ranges, not punctuation.
- **Answer-first phrasing** in the FAQ: the opening sentence of every answer
  must stand alone as a complete claim.

## Footer

The footer restates commitments the page already makes. Its marquee phrases are
condensed forms of SOP clauses already mapped above:

| Phrase | Source |
| --- | --- |
| "Your approval before anything posts" | SOP-002 §8.3 |
| "One Customer Manager, start to finish" | SOP-001 §6.2.1; SOP-U01 §3 |
| "Every AI draft read by a human" | SOP-009 §4, §8 |
| "No fabricated stats or testimonials" | SOP-007 §4 |
| "Live in 7 to 10 business days" | SOP-001 §6.2.6 |

The heading is the brand tagline. App-store and download links from the source
pattern are absent: there is no app.

## Removed: the UGC delivery-facts list

The six-item box under the UGC carousel (formats, platforms, turnaround,
revisions, approval gate) is removed from the page by request. Its facts remain
SOP-sourced and are still stated in `public/llms.txt`, and the two that matter
most to a buyer, turnaround and the approval gate, are in the FAQ.

## Footer, socials and blog

- The footer is compact (no full-height curtain). It carries the brand line,
  quick links, social icons, the contact email and a back-to-top control.
- Social profiles are real and verified: TikTok `@sublimeplus_`, Instagram
  `@sublimeplus_`, Facebook page `61592610954773`. They are linked in the
  footer and emitted as Organization `sameAs`, and listed in `llms.txt`.
- The contact email `try.sublime.plus@gmail.com` is a `mailto:` link.
- The blog has been removed entirely (route, components, content, sitemap
  entries and BlogPosting/Breadcrumb schema) by request.

## Buttons

Every call-to-action on the page opens the booking modal: both hero buttons,
the plan cards, the custom add-ons button, the UGC button and the final CTA.
The nav "Book a Call" and the footer quick links are the only exceptions (the
latter are in-page navigation, not CTAs).
