import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isLoggedIn } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * Suggests a cover image for a post. Nothing is saved here: the image goes
 * back to the editor and is only committed if the admin accepts it.
 *
 * Providers, best first, each used only when configured:
 *   1. Google Gemini  — secret GEMINI_API_KEY (free key from Google AI Studio)
 *   2. OpenAI         — secret OPENAI_API_KEY (paid per image)
 *   3. Workers AI     — the `ai` binding; free daily allowance, lower quality
 * If a provider fails (quota, outage) the next one is tried, and the editor is
 * told which one produced the image.
 *
 * CPU matters here. On the Workers free plan a request gets ~10ms of CPU, and
 * parsing a multi-megabyte JSON image response can blow through that (error
 * 1102). So Gemini's and OpenAI's responses are streamed to the browser
 * untouched — the browser does the parsing — rather than read in the Worker.
 */

type AiBinding = { run(model: string, input: Record<string, unknown>): Promise<unknown> };
type Env = {
  AI?: AiBinding;
  GEMINI_API_KEY?: string;
  GEMINI_IMAGE_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_IMAGE_MODEL?: string;
};

function buildPrompt(title: string, excerpt: string, body: string) {
  return [
    `Create a cover image for a blog article titled "${title}".`,
    excerpt ? `Summary: ${excerpt}` : "",
    body ? `Opening of the article: ${body}` : "",
    "The image must make the article's specific subject obvious at a glance —",
    "a concrete, meaningful scene or visual metaphor for this exact topic, not a generic abstract background.",
    "Style: high-quality editorial photograph or polished 3D illustration, as used by a professional",
    "marketing or tech publication; natural lighting, sharp focus, strong composition.",
    "Subtle colour palette of deep forest green and teal with small lime-green accents.",
    "Wide 16:9 landscape. Absolutely no text, letters, numbers, logos, UI screenshots or watermarks.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 3000);
}

/** Collapses Markdown to plain text so the prompt carries meaning, not syntax. */
function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

/** Error bodies are small, so reading one costs nothing worth worrying about. */
async function errorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } | string };
    const message = typeof data.error === "string" ? data.error : data.error?.message;
    return message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

function passThrough(upstream: Response, provider: string, note: string[]) {
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Image-Provider": provider,
      ...(note.length ? { "X-Image-Note": encodeURIComponent(note.join(" ")) } : {}),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const input = (await request.json().catch(() => ({}))) as {
    title?: unknown;
    excerpt?: unknown;
    body?: unknown;
  };
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 200) : "";
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim().slice(0, 500) : "";
  const body = typeof input.body === "string" ? plainText(input.body) : "";
  if (!title) {
    return NextResponse.json(
      { error: "Write a title first — the image is generated from it." },
      { status: 400 }
    );
  }

  let env: Env = {};
  try {
    env = getCloudflareContext().env as Env;
  } catch {
    // Plain `next dev`: fall back to process.env for the keys.
    env = process.env as Env;
  }

  const prompt = buildPrompt(title, excerpt, body);
  // Reasons earlier providers were skipped, shown under the image.
  const note: string[] = [];

  if (env.GEMINI_API_KEY) {
    const model = env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: { aspectRatio: "16:9" },
            },
          }),
        }
      );
      if (response.ok) return passThrough(response, "gemini", note);
      note.push(`Gemini failed (${await errorMessage(response)}).`);
    } catch {
      note.push("Gemini could not be reached.");
    }
  }

  if (env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_IMAGE_MODEL || "gpt-image-1",
          prompt,
          size: "1536x1024",
          quality: "medium",
          output_format: "jpeg",
          n: 1,
        }),
      });
      if (response.ok) return passThrough(response, "openai", note);
      note.push(`ChatGPT images failed (${await errorMessage(response)}).`);
    } catch {
      note.push("ChatGPT images could not be reached.");
    }
  }

  if (!env.AI) {
    return NextResponse.json(
      {
        error:
          note.join(" ") ||
          "No image generator is configured. Add a GEMINI_API_KEY secret, or deploy with the Workers AI binding.",
      },
      { status: 503 }
    );
  }

  try {
    // flux-1-schnell returns a small JPEG (~100-200 KB), cheap to relay.
    const result = (await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      prompt,
      steps: 8,
    })) as { image?: string };
    if (!result?.image) throw new Error("empty result");
    return NextResponse.json(
      { type: "image/jpeg", data: result.image },
      {
        headers: {
          "X-Image-Provider": "cloudflare",
          ...(note.length ? { "X-Image-Note": encodeURIComponent(note.join(" ")) } : {}),
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const limited = /limit|quota|neuron|429/i.test(message);
    return NextResponse.json(
      {
        error: [
          ...note,
          limited
            ? "Today's free Cloudflare image allowance is used up. Try again tomorrow, or upload your own."
            : "Could not generate an image right now. Try again, or upload your own.",
        ].join(" "),
      },
      { status: limited ? 429 : 502 }
    );
  }
}
