import { cookies } from "next/headers";

/**
 * Session handling for /admin.
 *
 * One admin, one password, a signed HTTP-only cookie. There is no user table
 * and no external identity provider, which is the right size for a single
 * person editing their own blog — but it does mean the password is the only
 * thing standing in front of the editor, so it belongs in a Worker secret and
 * nowhere else.
 *
 * Everything here uses Web Crypto rather than node:crypto: the same code has
 * to run under workerd in production and under Node in `next dev`.
 */

export const SESSION_COOKIE = "sublime_admin";

/** Eight hours. Long enough for a writing session, short enough to matter. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminConfigured() {
  return adminPassword().length > 0;
}

/**
 * The cookie signing key. A dedicated secret is preferred; falling back to the
 * password keeps setup to a single secret, and has the useful property that
 * changing the password invalidates every existing session.
 */
function signingSecret() {
  return process.env.ADMIN_SESSION_SECRET || adminPassword();
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Compares in time independent of how many characters match, so a response
 * time cannot be used to recover the password one character at a time.
 */
export function safeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  // Comparing lengths directly would leak the password's length, so fold the
  // length difference into the same accumulator as the bytes.
  let mismatch = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) {
    mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return mismatch === 0;
}

export async function createSessionToken(now = Date.now()) {
  const expiresAt = now + SESSION_TTL_MS;
  return `${expiresAt}.${await hmac(String(expiresAt))}`;
}

export async function isValidSessionToken(token: string | undefined, now = Date.now()) {
  if (!token || !isAdminConfigured()) return false;

  const separator = token.indexOf(".");
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < now) return false;

  return safeEqual(signature, await hmac(expiresAt));
}

/** Reads the request's cookie. Use from server components and route handlers. */
export async function isLoggedIn() {
  const jar = await cookies();
  return isValidSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Not readable by JavaScript, not sent cross-site, and over HTTPS only in
    // production. `next dev` runs on plain HTTP, where a Secure cookie would
    // simply never be stored.
    secure,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
