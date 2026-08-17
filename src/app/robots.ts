import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * AI crawlers are allowed deliberately, not by omission.
 *
 * Sublime+ sells LLM brand perception as a service, so being readable by the
 * models that answer questions about the company is the point. If that position
 * ever changes it should change here, explicitly.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
