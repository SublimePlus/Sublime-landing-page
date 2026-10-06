import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { GitHubError, deletePostFile, getPostFile } from "@/lib/admin/github";
import { parsePost } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}

function fromGitHubError(error: unknown) {
  if (error instanceof GitHubError) {
    const status = error.status === 401 || error.status === 403 ? 502 : error.status;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isLoggedIn())) return unauthorized();

  const { slug } = await params;

  try {
    const stored = await getPostFile(slug);
    if (!stored) {
      return NextResponse.json({ error: "No such post." }, { status: 404 });
    }
    return NextResponse.json({ post: parsePost(slug, stored.markdown), sha: stored.sha });
  } catch (error) {
    return fromGitHubError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isLoggedIn())) return unauthorized();

  const { slug } = await params;

  try {
    const stored = await getPostFile(slug);
    if (!stored) {
      return NextResponse.json({ error: "No such post." }, { status: 404 });
    }

    await deletePostFile(slug, stored.sha, `Delete blog post: ${slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fromGitHubError(error);
  }
}
