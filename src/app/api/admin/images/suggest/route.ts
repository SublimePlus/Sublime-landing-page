import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isLoggedIn } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * Generates a suggested cover image for a post with Workers AI, which is
 * included in the Cloudflare plan's free daily allowance — no API key, no
 * third-party account. Roughly 150+ images a day fit in that allowance.
 *
 * Nothing is saved here. The image comes back to the editor as base64 and is
 * only committed if the admin accepts it, through the normal upload route.
 */
const MODEL = "@cf/black-forest-labs/flux-1-schnell";

type AiBinding = { run(model: string, input: Record<string, unknown>): Promise<unknown> };

/**
 * The style half of the prompt is fixed so every cover looks like it belongs
 * to the same site; the subject half comes from the post itself. Image models
 * render text badly, hence the explicit "no text".
 */
function buildPrompt(title: string, excerpt: string) {
  return [
    `Editorial cover illustration for a blog article titled "${title}".`,
    excerpt ? `The article is about: ${excerpt}` : "",
    "Show a clear visual metaphor for the topic.",
    "Modern, clean, minimal, soft lighting, professional marketing blog style.",
    "Colour palette of deep forest green, teal and small lime-green accents.",
    "Wide landscape composition. No text, no letters, no words, no logos, no watermarks.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 2000);
}

export async function POST(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { title?: unknown; excerpt?: unknown };
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 500) : "";
  if (!title) {
    return NextResponse.json(
      { error: "Write a title first — the image is generated from it." },
      { status: 400 }
    );
  }

  let ai: AiBinding | undefined;
  try {
    ai = (getCloudflareContext().env as { AI?: AiBinding }).AI;
  } catch {
    // Not running inside the Worker (plain `next dev`).
  }
  if (!ai) {
    return NextResponse.json(
      { error: "Image generation only works on the deployed site (it needs the Workers AI binding)." },
      { status: 503 }
    );
  }

  try {
    const result = (await ai.run(MODEL, { prompt: buildPrompt(title, excerpt), steps: 6 })) as {
      image?: string;
    };
    if (!result?.image) throw new Error("empty result");
    return NextResponse.json({ type: "image/jpeg", data: result.image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // The free allowance resets daily; say so rather than surfacing a raw error.
    const limited = /limit|quota|neuron|429/i.test(message);
    return NextResponse.json(
      {
        error: limited
          ? "Today's free image allowance is used up. Try again tomorrow, or upload your own."
          : "Could not generate an image right now. Try again, or upload your own.",
      },
      { status: limited ? 429 : 502 }
    );
  }
}
