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

/**
 * Trimmed to the five questions that decide a booking: when it goes live, who
 * controls what gets published, whether AI writes it, whether results are
 * promised, and how billing works. The longer set is still served to machines
 * in `public/llms.txt`, which is not competing for a visitor's attention.
 */
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
    // SOP-U01 §16; SOP-S01 §15; SOP-007 §4
    question: "Can you guarantee results?",
    answer:
      "No, and anyone who does is telling you something they cannot back. We make no promises of specific engagement results or guaranteed reach. What we do commit to is that the numbers you see are real: we do not fabricate engagement metrics, inflate performance figures, or invent statistics, testimonials or case studies.",
  },
  {
    // SOP-S01 §12.1
    question: "How does billing work?",
    answer:
      "Monthly and upfront, on a month-to-month cycle that continues automatically. Service begins once payment is confirmed, and there is no monthly renewal step for you to action. Package prices are presented in full on the call, with no hidden costs.",
  },
];
