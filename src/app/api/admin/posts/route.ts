import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { GitHubError, getPostFile, listPosts, savePostFile } from "@/lib/admin/github";
import { parsePost, serializePost, validatePost, type PostInput } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}

function fromGitHubError(error: unknown) {
  if (error instanceof GitHubError) {
    // 401/403 from GitHub means our token is wrong, not that the admin's
    // session expired — don't bounce them back to a login that cannot help.
    const status = error.status === 401 || error.status === 403 ? 502 : error.status;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
}

/** The post list, read live from the repository rather than from the bundle. */
export async function GET() {
  if (!(await isLoggedIn())) return unauthorized();

  try {
    const files = await listPosts();
    const posts = await Promise.all(
      files.map(async (file) => {
        const stored = await getPostFile(file.slug);
        const parsed = stored
          ? parsePost(file.slug, stored.markdown)
          : { slug: file.slug, title: file.slug, excerpt: "", date: "", tone: "teal" as const, body: "" };
        return {
          slug: parsed.slug,
          title: parsed.title,
          excerpt: parsed.excerpt,
          date: parsed.date,
          tone: parsed.tone,
        };
      })
    );

    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ posts });
  } catch (error) {
    return fromGitHubError(error);
  }
}

/** Creates or updates a post, committing it to the repository. */
export async function POST(request: Request) {
  if (!(await isLoggedIn())) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as Partial<PostInput> & {
    sha?: string;
    isNew?: boolean;
  };

  const errors = validatePost(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const input = body as PostInput;

  try {
    const existing = await getPostFile(input.slug);

    // Creating a post must never silently replace one that already exists.
    if (body.isNew && existing) {
      return NextResponse.json(
        { errors: [{ field: "slug", message: "A post with that slug already exists." }] },
        { status: 409 }
      );
    }

    await savePostFile(
      input.slug,
      serializePost(input),
      existing?.sha,
      `${body.isNew ? "Add" : "Update"} blog post: ${input.title}`
    );

    return NextResponse.json({ ok: true, slug: input.slug });
  } catch (error) {
    // A 409 here is GitHub rejecting a stale sha: someone else changed the
    // file since this editor loaded it.
    if (error instanceof GitHubError && error.status === 409) {
      return NextResponse.json(
        { error: "This post changed since you opened it. Reload and reapply your edit." },
        { status: 409 }
      );
    }
    return fromGitHubError(error);
  }
}
