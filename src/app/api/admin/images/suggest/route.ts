import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isLoggedIn } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * Suggests a cover image for a post. Nothing is saved here: the image goes
 * back to the editor and is only committed if the admin accepts it.
 *
 * Providers, best first, each used only when configured:
 *   0. Kie.ai         — secret KIE_API_KEY (paid credits). Asynchronous: POST
 *                       starts a task, GET polls it, GET &download=1 streams
 *                       the finished image. Exactly one task per click.
 *   1. Google Gemini  — secret GEMINI_API_KEY (needs billing on the key)
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
  KIE_API_KEY?: string;
  KIE_IMAGE_MODEL?: string;
  KIE_GPT_IMAGE_MODEL?: string;
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

/**
 * Turns the post into a specific image prompt with a free Workers AI text
 * model, so the paid image model gets one well-aimed attempt instead of
 * several vague ones. Falls back to the fixed template if that fails.
 */
async function writePrompt(env: Env, title: string, excerpt: string, body: string) {
  const fallback = buildPrompt(title, excerpt, body);
  if (!env.AI) return fallback;
  try {
    const result = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You write prompts for an AI image generator. Given a blog post, reply with ONE prompt " +
            "of 60-90 words describing a single concrete, realistic scene that makes the post's " +
            "specific subject obvious at a glance: subject, setting, objects, composition, lighting. " +
            "Style: high-quality editorial photograph. Palette: deep forest green and teal with small " +
            "lime-green accents. Wide 16:9. The image must contain no text, letters, numbers, logos, " +
            "screens with readable UI, or watermarks. Reply with the prompt only.",
        },
        {
          role: "user",
          content: `Title: ${title}\nSummary: ${excerpt}\nPost: ${body}`,
        },
      ],
    })) as { response?: string };
    const prompt = result?.response?.trim().replace(/^["']|["']$/g, "");
    return prompt && prompt.length > 40 ? `${prompt} No text, letters or logos anywhere.` : fallback;
  } catch {
    return fallback;
  }
}

const KIE_API = "https://api.kie.ai/api/v1/jobs";

/**
 * The two Kie models offered in the editor. Each model takes its own input
 * shape, so the shape lives with the model. IDs can be overridden with the
 * KIE_GPT_IMAGE_MODEL / KIE_IMAGE_MODEL vars if Kie renames them.
 */
const KIE_MODELS = {
  gpt: {
    label: "ChatGPT image (GPT Image)",
    id: (env: Env) => env.KIE_GPT_IMAGE_MODEL || "gpt-image/1.5-text-to-image",
    input: (prompt: string) => ({ prompt, aspect_ratio: "3:2", quality: "medium" }),
  },
  nano: {
    label: "Nano Banana",
    id: (env: Env) => env.KIE_IMAGE_MODEL || "google/nano-banana",
    input: (prompt: string) => ({ prompt, output_format: "jpeg", image_size: "16:9" }),
  },
} as const;
type KieModel = keyof typeof KIE_MODELS;

/** Starts one Kie task. A rejected task costs no credits. */
async function kieCreateTask(env: Env, model: KieModel, prompt: string) {
  const response = await fetch(`${KIE_API}/createTask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.KIE_API_KEY}` },
    body: JSON.stringify({ model: KIE_MODELS[model].id(env), input: KIE_MODELS[model].input(prompt) }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: number;
    msg?: string;
    data?: { taskId?: string };
  };
  const taskId = data.data?.taskId;
  if (response.ok && data.code === 200 && taskId) return { taskId };
  // Kie answers 200 with an error code in the body (e.g. 402: no credits).
  return { error: data.msg || `code ${data.code ?? response.status}` };
}

type KieRecord = {
  code?: number;
  msg?: string;
  data?: { state?: string; resultJson?: string; failMsg?: string };
};

async function kieRecord(env: Env, taskId: string): Promise<KieRecord> {
  const response = await fetch(`${KIE_API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${env.KIE_API_KEY}` },
  });
  return (await response.json().catch(() => ({}))) as KieRecord;
}

function kieResultUrl(record: KieRecord) {
  try {
    const parsed = JSON.parse(record.data?.resultJson ?? "{}") as { resultUrls?: string[] };
    const url = parsed.resultUrls?.[0];
    return url && url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

function readEnv(): Env {
  try {
    return getCloudflareContext().env as Env;
  } catch {
    // Plain `next dev`: fall back to process.env for the keys.
    return process.env as Env;
  }
}

/**
 * Polls a Kie task: `?taskId=…` returns `{ state, url? }`. With `&download=1`
 * it streams the finished image itself, so the browser can shrink and upload
 * it without needing CORS access to Kie's file host. Polling costs no credits.
 */
export async function GET(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const env = readEnv();
  const params = new URL(request.url).searchParams;
  const taskId = params.get("taskId") ?? "";
  if (!env.KIE_API_KEY || !/^[\w-]{1,128}$/.test(taskId)) {
    return NextResponse.json({ error: "Unknown image task." }, { status: 400 });
  }

  try {
    const record = await kieRecord(env, taskId);
    const state = record.data?.state ?? "unknown";
    if (state === "fail") {
      return NextResponse.json({ state, error: record.data?.failMsg || "Kie could not make this image." });
    }
    const url = state === "success" ? kieResultUrl(record) : null;
    if (params.get("download") === "1") {
      if (!url) return NextResponse.json({ error: "The image is not ready." }, { status: 409 });
      const file = await fetch(url);
      if (!file.ok || !file.body) {
        return NextResponse.json({ error: "Could not download the image." }, { status: 502 });
      }
      return new Response(file.body, {
        headers: {
          "Content-Type": file.headers.get("Content-Type") || "image/png",
          "Cache-Control": "no-store",
        },
      });
    }
    return NextResponse.json({ state, url });
  } catch {
    return NextResponse.json({ error: "Could not reach Kie." }, { status: 502 });
  }
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
    imagePrompt?: unknown;
    model?: unknown;
  };
  // A prompt typed by the admin is used as-is instead of one written from the post.
  const customPrompt =
    typeof input.imagePrompt === "string" ? input.imagePrompt.trim().slice(0, 2000) : "";
  const kieModel: KieModel = input.model === "nano" ? "nano" : "gpt";
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 200) : "";
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim().slice(0, 500) : "";
  const body = typeof input.body === "string" ? plainText(input.body) : "";
  if (!title && !customPrompt) {
    return NextResponse.json(
      { error: "Write a title or an image prompt first." },
      { status: 400 }
    );
  }

  const env = readEnv();
  // Reasons earlier providers were skipped, shown under the image.
  const note: string[] = [];

  if (env.KIE_API_KEY) {
    const kiePrompt = customPrompt || (await writePrompt(env, title, excerpt, body));
    try {
      let used: KieModel = kieModel;
      let result = await kieCreateTask(env, used, kiePrompt);
      // If the chosen model is rejected (renamed, unavailable), try the other
      // one once. Rejected tasks are not charged, so this never double-bills.
      if ("error" in result) {
        note.push(`${KIE_MODELS[used].label} failed (${result.error}).`);
        used = used === "gpt" ? "nano" : "gpt";
        result = await kieCreateTask(env, used, kiePrompt);
      }
      if ("taskId" in result) {
        return NextResponse.json(
          { taskId: result.taskId, prompt: kiePrompt, modelLabel: KIE_MODELS[used].label },
          {
            headers: {
              "X-Image-Provider": "kie",
              ...(note.length ? { "X-Image-Note": encodeURIComponent(note.join(" ")) } : {}),
            },
          }
        );
      }
      note.push(`${KIE_MODELS[used].label} failed (${result.error}).`);
    } catch {
      note.push("Kie could not be reached.");
    }
  }

  const prompt = customPrompt || buildPrompt(title, excerpt, body);

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
