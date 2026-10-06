import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * AI crawlers are allowed deliberately, not by omission.
 *
 * Sublime Plus sells LLM brand perception as a service, so being readable by the
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
      // /admin and its API are the editor, not content. They are behind a
      // password either way; this keeps them out of indexes as well.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/admin", "/api/"],
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
