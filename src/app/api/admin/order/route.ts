import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { GitHubError, getOrderFile, listPosts, saveOrderFile } from "@/lib/admin/github";
import { isValidSlug } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

/** Saves the display order: `{ slugs: string[] }`, first shown first. */
export async function PUT(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { slugs?: unknown };
  const slugs = Array.isArray(body.slugs) ? body.slugs : null;
  if (!slugs || !slugs.every(isValidSlug) || new Set(slugs).size !== slugs.length) {
    return NextResponse.json({ error: "Expected a list of distinct post slugs." }, { status: 400 });
  }

  try {
    // Drop slugs that no longer exist rather than storing them forever.
    const existing = new Set((await listPosts()).map((post) => post.slug));
    const current = await getOrderFile();
    await saveOrderFile(
      slugs.filter((slug) => existing.has(slug)),
      current.sha
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof GitHubError) {
      const status = error.status === 401 || error.status === 403 ? 502 : error.status;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
  }
}
