import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { GitHubError, createImageBlob, saveImageFile } from "@/lib/admin/github";
import { slugify } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

/**
 * Raster formats only. SVG is left out on purpose: it can carry script, and
 * these files are served from the site's own origin.
 */
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Images are committed to git and served unoptimised, so keep them small. */
const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Uploads an image: `{ name, type, data }`, where `data` is the file as base64.
 * Returns the public path, e.g. `/blog-images/team-photo-k3x9.webp`. The file
 * is live once the deploy its commit triggers finishes.
 *
 * With `stage: true` nothing is committed: the bytes are stored as a git blob
 * and `{ path, sha }` comes back for the schedule page to commit together
 * with its posts.
 */
export async function POST(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    type?: unknown;
    data?: unknown;
    stage?: unknown;
  };

  const ext = typeof body.type === "string" ? TYPES[body.type] : undefined;
  if (!ext) {
    return NextResponse.json({ error: "Use a PNG, JPEG, WebP or GIF image." }, { status: 400 });
  }
  if (typeof body.data !== "string" || !/^[A-Za-z0-9+/]+=*$/.test(body.data)) {
    return NextResponse.json({ error: "The image data is unreadable." }, { status: 400 });
  }
  if ((body.data.length * 3) / 4 > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is over 3 MB. Export it smaller (WebP or JPEG) and try again." },
      { status: 400 }
    );
  }

  const base = slugify(typeof body.name === "string" ? body.name.replace(/\.[^.]+$/, "") : "")
    .slice(0, 40)
    .replace(/-+$/, "");
  const suffix = crypto.randomUUID().slice(0, 8);
  const fileName = `${base || "image"}-${suffix}.${ext}`;

  try {
    if (body.stage === true) {
      const sha = await createImageBlob(body.data);
      return NextResponse.json({ path: `/blog-images/${fileName}`, sha });
    }
    await saveImageFile(fileName, body.data);
    return NextResponse.json({ path: `/blog-images/${fileName}` });
  } catch (error) {
    if (error instanceof GitHubError) {
      const status = error.status === 401 || error.status === 403 ? 502 : error.status;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
  }
}
