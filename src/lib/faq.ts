/**
 * Every answer below is drawn from a Sublime+ SOP — the source is named in the
 * comment above each entry, and `docs/sop-copy-map.md` carries the full map.
 *
 * Answers are written answer-first on purpose: the opening sentence has to be
 * a complete, standalone claim, because that is the unit a language model
 * lifts when it cites a page. "It depends on your needs" is uncitable;
 * "Your first content is live within 7–10 business days" is not.
 *
 * These same pairs are emitted as FAQPage structured data, so an unverified
 * answer here becomes a machine-readable false claim. Nothing goes in this
 * array without an SOP clause behind it.
 */
export type FaqItem = { question: string; answer: string };

export const faqs: FaqItem[] = [
  {
    // SOP-001 §6.2.6
    question: "How quickly will my first content go live?",
    answer:
      "Your first content is live within 7–10 business days of onboarding. Your first deliverables reach you for approval within 2–4 business days of that same onboarding meeting, and the gap between the two is your review time plus any edits you ask for.",
  },
  {
    // SOP-002 §8.3, §9.1; SOP-004 §4; SOP-U01 §16
    question: "Could you post something I haven't seen?",
    answer:
      "No. Nothing is posted before you approve it in writing, without exception. If you ask for changes, the deliverable is immediately marked as non-approved and re-enters the full review cycle before it can come back to you. Silence is never treated as approval, and a passing deadline does not turn an unapproved draft into an approved one.",
  },
  {
    // SOP-009 §4, §5, §6.1, §8
    question: "Do you use AI to write the content?",
    answer:
      "Yes, and we would rather say so plainly. AI drafts posts, comments, replies, blogs and content plans, and that is a large part of why we can work at the pace and price we do. Every single output is then read and verified by your Customer Manager before it advances, and the person who submits or posts it carries full responsibility for it regardless of how it was drafted.",
  },
  {
    // SOP-001 §6.2.1; SOP-U01 §3; SOP-S01 §12.2
    question: "Who will I actually be dealing with?",
    answer:
      "One Customer Manager, from onboarding onwards. They are introduced to you at hand-off and then own your account and every deliverable in it. The salesperson who closed your deal steps out of the relationship at that point rather than staying as a second contact.",
  },
  {
    // SOP-001 §5; SOP-U01 §9.3, §10
    question: "What do you need from me to get started?",
    answer:
      "Less than most agencies ask for, because we research you before we meet. We audit your website, socials, review sites and SEO profile, and run an LLM perception check, then bring it all to a 30–45 minute onboarding call for you to confirm or correct. What we need from you is that hour, your brand guidelines and tone preferences, and for UGC work, reference images of your product, ideally a full 360-degree set.",
  },
  {
    // SOP-002 §9.4, §9.5 (Reddit content); SOP-U01 §13 (UGC)
    question: "How many rounds of edits do I get?",
    answer:
      "On written content, as many as you ask for. Before making an edit we will ask you for the context behind it, so the change lands the first time instead of after three rounds of guessing. UGC deliverables work differently: those carry an agreed 2–3 revision rounds per batch, set during onboarding and written into your contract, with revised work back within 1–2 business days.",
  },
  {
    // SOP-004 (Reddit); SOP-U01 §5.1 (UGC platforms)
    question: "Which platforms do you cover?",
    answer:
      "Reddit is the core of the written service, because it is where the search and AI-visibility gains come from. UGC visual content is delivered for and posted on Instagram, Reddit, Facebook, Pinterest, Etsy and TikTok, with other platforms available by request.",
  },
  {
    // SOP-004 §8; SOP-008 §4, §5
    question: "What happens if a post gets removed or the comments turn hostile?",
    answer:
      "It gets escalated internally the same day, and nobody improvises a response. We do not repost or argue with moderators without direction from a Senior Manager. Content removal, significant negative backlash and underperforming campaigns are all classed as escalation events with a documented protocol behind them, and for significant mistakes a Senior Manager leads the conversation with you directly.",
  },
  {
    // SOP-U01 §16; SOP-S01 §15; SOP-007 §4
    question: "Can you guarantee results?",
    answer:
      "No, and anyone who does is telling you something they cannot back. We make no promises of specific engagement results or guaranteed reach. What we do commit to is that the numbers you see are real: we do not fabricate engagement metrics, inflate performance figures, or invent statistics, testimonials or case studies.",
  },
  {
    // SOP-007 §5; SOP-S01 §5.3; SOP-U01 §6.1
    question: "Are there businesses you won't work with?",
    answer:
      "Yes, and the list is non-negotiable. We decline hate speech and identity-based targeting, sexual exploitation, substance abuse and illegal drug promotion, gambling and alcohol promotion, and any illegal activity. UGC work additionally excludes underage characters, celebrity lookalikes, weapons and violence, and political or religious content. A client request cannot override any of it.",
  },
  {
    // SOP-U01 §4.4
    question: "Is AI-generated content disclosed as AI?",
    answer:
      "Always, on every account we run. Every AI influencer and blogger account states in its bio and in every post description that the content is AI-generated, and platform AI labels are applied wherever they exist. Sponsored content that passes an AI persona off as a real person is exactly the misrepresentation our ethical standards prohibit.",
  },
  {
    // SOP-S01 §12.1
    question: "How does billing work?",
    answer:
      "Monthly and upfront, on a month-to-month cycle that continues automatically. Service begins once payment is confirmed, and there is no monthly renewal step for you to action. Package prices are presented in full on the call, with no hidden costs.",
  },
];
