import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import {
  GitHubError,
  deleteScheduledFile,
  getScheduledFile,
  saveScheduledFile,
} from "@/lib/admin/github";
import { isValidSlug } from "@/lib/admin/posts";
import { parseScheduled, withPublishAt } from "@/lib/admin/schedule";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

function fromGitHubError(error: unknown) {
  if (error instanceof GitHubError) {
    const status = error.status === 401 || error.status === 403 ? 502 : error.status;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
}

async function load(context: Context) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return null;
  const file = await getScheduledFile(slug);
  return file ? { slug, ...file } : null;
}

/**
 * Changes when a scheduled post goes live. `{ publishAt: "now" }` publishes it
 * on the scheduler's next run (within about ten minutes).
 */
export async function PATCH(request: Request, context: Context) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { publishAt?: string };
  const publishAt = body.publishAt === "now" ? new Date().toISOString() : String(body.publishAt ?? "");
  if (Number.isNaN(Date.parse(publishAt))) {
    return NextResponse.json({ error: "Pick a valid date and time." }, { status: 400 });
  }

  try {
    const file = await load(context);
    if (!file) return NextResponse.json({ error: "That post is no longer scheduled." }, { status: 404 });

    const post = parseScheduled(file.slug, file.markdown);
    await saveScheduledFile(
      file.slug,
      withPublishAt(file.markdown, publishAt),
      file.sha,
      body.publishAt === "now"
        ? `Publish blog post now: ${post.title}`
        : `Reschedule blog post: ${post.title}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fromGitHubError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  try {
    const file = await load(context);
    if (!file) return NextResponse.json({ ok: true });
    const post = parseScheduled(file.slug, file.markdown);
    await deleteScheduledFile(file.slug, file.sha, `Cancel scheduled blog post: ${post.title}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fromGitHubError(error);
  }
}
