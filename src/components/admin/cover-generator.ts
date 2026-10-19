"use client";

/**
 * Cover generation shared by the post editor and the schedule page. The
 * server picks the provider (see /api/admin/images/suggest); this side polls
 * Kie tasks and pulls the image out of whichever provider answered.
 */

export type Suggestion = {
  provider: string;
  type?: string;
  data?: string;
  url?: string;
  taskId?: string;
  prompt?: string;
  note?: string;
  /** Which Kie model made it, when Kie did. */
  modelLabel?: string;
};

export const PROVIDER_NAMES: Record<string, string> = {
  kie: "Kie.ai",
  gemini: "Google Gemini",
  openai: "ChatGPT (OpenAI)",
  cloudflare: "Cloudflare Workers AI",
};

/**
 * Pulls the image out of whichever provider answered. Gemini and OpenAI
 * responses arrive untouched (see the route for why), so they are parsed here.
 */
function extractImage(provider: string, json: unknown): { type: string; data: string } | null {
  if (provider === "gemini") {
    type Part = { inlineData?: { mimeType?: string; data?: string }; inline_data?: { mime_type?: string; data?: string } };
    const parts =
      (json as { candidates?: { content?: { parts?: Part[] } }[] }).candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData ?? (part.inline_data && { mimeType: part.inline_data.mime_type, data: part.inline_data.data });
      if (inline?.data) return { type: inline.mimeType || "image/png", data: inline.data };
    }
    return null;
  }
  if (provider === "openai") {
    const b64 = (json as { data?: { b64_json?: string }[] }).data?.[0]?.b64_json;
    return b64 ? { type: "image/jpeg", data: b64 } : null;
  }
  const flat = json as { type?: string; data?: string };
  return flat.data && flat.type ? { type: flat.type, data: flat.data } : null;
}

export type ImageModel = "gpt" | "nano";

/** Asks the server for a cover. Pure fetch, so effects can call it directly. */
export async function fetchSuggestion(
  title: string,
  excerpt: string,
  body: string,
  imagePrompt = "",
  model: ImageModel = "gpt"
): Promise<{ suggestion: Suggestion } | { error: string }> {
  try {
    const response = await fetch("/api/admin/images/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, body, imagePrompt, model }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) return { error: json.error ?? "Could not generate an image." };

    const provider = response.headers.get("X-Image-Provider") ?? "cloudflare";
    const rawNote = response.headers.get("X-Image-Note");

    if (provider === "kie") {
      const { taskId, prompt, modelLabel } = json as {
        taskId?: string;
        prompt?: string;
        modelLabel?: string;
      };
      if (!taskId) return { error: "Kie did not start the image." };
      // Kie works asynchronously. Polling is free; only the task costs credits.
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const poll = await fetch(`/api/admin/images/suggest?taskId=${encodeURIComponent(taskId)}`, {
          cache: "no-store",
        });
        const status = (await poll.json().catch(() => ({}))) as {
          state?: string;
          url?: string;
          error?: string;
        };
        if (!poll.ok || status.state === "fail") {
          return { error: status.error ?? "Kie could not make this image." };
        }
        if (status.state === "success" && status.url) {
          return {
            suggestion: {
              provider,
              url: status.url,
              taskId,
              prompt,
              modelLabel,
              note: rawNote ? decodeURIComponent(rawNote) : undefined,
            },
          };
        }
      }
      return { error: "Kie is taking too long. Try again in a minute." };
    }

    const image = extractImage(provider, json);
    if (!image) {
      return { error: `${PROVIDER_NAMES[provider] ?? provider} returned no image. Try again.` };
    }
    return {
      suggestion: { ...image, provider, note: rawNote ? decodeURIComponent(rawNote) : undefined },
    };
  } catch {
    return { error: "Could not reach the server." };
  }
}

/** The suggested image as a Blob: Kie's file through our server, others from their bytes. */
export async function suggestionBlob(suggestion: Suggestion): Promise<Blob> {
  if (suggestion.taskId) {
    const response = await fetch(
      `/api/admin/images/suggest?taskId=${encodeURIComponent(suggestion.taskId)}&download=1`
    );
    if (!response.ok) throw new Error("Could not download the generated image.");
    return response.blob();
  }
  return (await fetch(`data:${suggestion.type};base64,${suggestion.data}`)).blob();
}
