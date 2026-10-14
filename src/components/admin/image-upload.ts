"use client";

/**
 * Image upload for the admin editors: shrink in the browser, then commit
 * through /api/admin/images. Uploaded files only exist on the live site after
 * the deploy their commit triggers, so callers preview the local file meanwhile.
 */

/** Covers display at most ~1200px wide; 1600 leaves room for sharp screens. */
const MAX_IMAGE_WIDTH = 1600;

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Shrinks an image in the browser before it is uploaded: scaled to at most
 * MAX_IMAGE_WIDTH and re-encoded as WebP (JPEG where WebP encoding is missing).
 *
 * This matters twice over. Uploads travel as base64 JSON, and parsing a
 * multi-megabyte body can exceed the Worker's per-request CPU limit (error
 * 1102). And every visitor downloads the cover, so a 2 MB PNG is a slow page.
 * GIFs are left alone so animations survive.
 */
export async function compressImage(blob: Blob): Promise<{ type: string; data: string }> {
  if (blob.type === "image/gif") return { type: blob.type, data: await blobToBase64(blob) };

  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
    let out = await encode("image/webp");
    // Browsers that cannot encode WebP silently hand back a PNG instead.
    if (!out || out.type !== "image/webp") out = await encode("image/jpeg");
    // Keep the original if re-encoding somehow made it bigger.
    if (out && out.size < blob.size) return { type: out.type, data: await blobToBase64(out) };
  } catch {
    // Undecodable here (rare); fall through and let the server validate it.
  }
  return { type: blob.type, data: await blobToBase64(blob) };
}

export async function uploadImage(file: File): Promise<string> {
  const { type, data } = await compressImage(file);
  return uploadImageData(file.name, type, data);
}

/** Same as `uploadImage`, for bytes already in base64 (a generated suggestion). */
export async function uploadImageData(name: string, type: string, data: string): Promise<string> {
  const response = await fetch("/api/admin/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, data }),
  });
  const result = (await response.json().catch(() => ({}))) as { path?: string; error?: string };
  if (!response.ok || !result.path) throw new Error(result.error ?? "Could not upload the image.");
  return result.path;
}

/**
 * A suggested cover. Synchronous providers return the bytes (`data`); Kie
 * returns a hosted `url` plus the `taskId` the server downloads it through.
 */
