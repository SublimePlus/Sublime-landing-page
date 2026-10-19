import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import {
  GitHubError,
  addScheduledFiles,
  getScheduledFile,
  listPosts,
  listScheduled,
} from "@/lib/admin/github";
import { COVER_RE } from "@/lib/admin/posts";
import {
  parseScheduled,
  serializeScheduled,
  uniqueSlug,
  validateScheduled,
  type ScheduledInput,
} from "@/lib/admin/schedule";

export const dynamic = "force-dynamic";

/** The most posts one request may schedule; keeps the commit and the request small. */
const MAX_BATCH = 100;

function unauthorized() {
  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}

function fromGitHubError(error: unknown) {
  if (error instanceof GitHubError) {
    const status = error.status === 401 || error.status === 403 ? 502 : error.status;
    // A 422 on the ref update means someone else committed in between.
    if (error.status === 422) {
      return NextResponse.json(
        { error: "The site changed while saving. Click Schedule again." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
}

/** Scheduled posts, soonest first. */
export async function GET() {
  if (!(await isLoggedIn())) return unauthorized();

  try {
    const files = await listScheduled();
    const posts = await Promise.all(
      files.map(async (file) => {
        const stored = await getScheduledFile(file.slug);
        const post = stored ? parseScheduled(file.slug, stored.markdown) : null;
        return {
          slug: file.slug,
          title: post?.title ?? file.slug,
          publishAt: post?.publishAt ?? "",
          cover: post?.cover ?? "",
          author: post?.author ?? "",
          coverTries: post?.coverTries ?? 0,
          imageUrl: post?.imageUrl ?? "",
        };
      })
    );
    posts.sort((a, b) => a.publishAt.localeCompare(b.publishAt));
    return NextResponse.json({ posts });
  } catch (error) {
    return fromGitHubError(error);
  }
}

/** Schedules a batch of posts in one commit. */
export async function POST(request: Request) {
  if (!(await isLoggedIn())) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as {
    posts?: Partial<ScheduledInput>[];
    images?: { path?: unknown; sha?: unknown }[];
  };
  // Covers staged by /api/admin/images with `stage: true`.
  const images = (Array.isArray(body.images) ? body.images : []).flatMap((image) =>
    typeof image.path === "string" &&
    COVER_RE.test(image.path) &&
    typeof image.sha === "string" &&
    /^[0-9a-f]{40}$/.test(image.sha)
      ? [{ path: image.path, sha: image.sha }]
      : []
  );
  const incoming = Array.isArray(body.posts) ? body.posts : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Add at least one post." }, { status: 400 });
  }
  if (incoming.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Schedule at most ${MAX_BATCH} posts at a time.` },
      { status: 400 }
    );
  }

  try {
    const [published, scheduled] = await Promise.all([listPosts(), listScheduled()]);
    const taken = new Set([...published, ...scheduled].map((post) => post.slug));

    const problems: { index: number; message: string }[] = [];
    const files = incoming.map((raw, index) => {
      const input: ScheduledInput = {
        title: String(raw.title ?? "").trim(),
        excerpt: String(raw.excerpt ?? "").trim(),
        body: String(raw.body ?? ""),
        date: String(raw.date ?? ""),
        tone: raw.tone ?? "teal",
        author: String(raw.author ?? "").trim(),
        cover: String(raw.cover ?? ""),
        publishAt: String(raw.publishAt ?? ""),
        imagePrompt: String(raw.imagePrompt ?? ""),
        imageUrl: String(raw.imageUrl ?? "").trim(),
        slug: "",
      };
      input.slug = uniqueSlug(input.title, taken);
      for (const error of validateScheduled(input)) {
        problems.push({ index, message: error.message });
      }
      return { slug: input.slug, markdown: serializeScheduled(input) };
    });

    if (problems.length > 0) {
      return NextResponse.json({ problems }, { status: 400 });
    }

    await addScheduledFiles(
      files,
      images,
      files.length === 1 ? `Schedule blog post: ${incoming[0].title}` : `Schedule ${files.length} blog posts`
    );
    return NextResponse.json({ scheduled: files.map((file) => file.slug) });
  } catch (error) {
    return fromGitHubError(error);
  }
}
