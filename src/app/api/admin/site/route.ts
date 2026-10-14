import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { GitHubError, getSiteFile, saveSiteFile } from "@/lib/admin/github";
import { validateSiteContent } from "@/lib/admin/site-validate";
import { siteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

function fromGitHubError(error: unknown) {
  if (error instanceof GitHubError) {
    if (error.status === 409) {
      return NextResponse.json(
        { error: "The website content changed since you opened it. Reload and reapply your edit." },
        { status: 409 }
      );
    }
    const status = error.status === 401 || error.status === 403 ? 502 : error.status;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Could not reach GitHub." }, { status: 502 });
}

/** The website copy as committed right now (falls back to this deploy's copy). */
export async function GET() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const file = await getSiteFile();
    if (!file) return NextResponse.json({ content: siteContent });
    return NextResponse.json({ content: JSON.parse(file.json), sha: file.sha });
  } catch (error) {
    return fromGitHubError(error);
  }
}

/** Saves edited copy: `{ content, sha }`. Live after the triggered deploy. */
export async function PUT(request: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { content?: unknown; sha?: unknown };
  const problem = validateSiteContent(body.content, siteContent);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    await saveSiteFile(
      `${JSON.stringify(body.content, null, 2)}\n`,
      typeof body.sha === "string" ? body.sha : undefined
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fromGitHubError(error);
  }
}
