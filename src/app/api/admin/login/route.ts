import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  adminPassword,
  createSessionToken,
  isAdminConfigured,
  safeEqual,
  sessionCookieOptions,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured: set the ADMIN_PASSWORD secret." },
      { status: 503 }
    );
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };

  if (!password || !safeEqual(password, adminPassword())) {
    // Deliberately vague, and deliberately the same response for a missing and
    // a wrong password — neither tells a guesser anything they did not know.
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken(),
    sessionCookieOptions(new URL(request.url).protocol === "https:")
  );
  return response;
}
