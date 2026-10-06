"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not sign in.");
        return;
      }

      setPassword("");
      // The session cookie decides what /admin renders, so re-ask the server
      // rather than flipping a local flag.
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel mx-auto max-w-sm rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-pine dark:text-white">Sign in</h1>
      <p className="mt-2 text-sm text-stone dark:text-white/60">
        Blog admin for Sublime Plus.
      </p>

      {!configured && (
        <p className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-pine dark:text-white">
          No admin password is set on this deployment. Set the{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> secret before signing in.
        </p>
      )}

      <label className="mt-6 block text-sm font-medium text-pine dark:text-white">
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-pine/15 bg-white px-4 py-3 text-pine outline-none focus:border-teal dark:border-white/15 dark:bg-night/60 dark:text-white"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !configured}
        className="neon-teal-btn mt-6 w-full rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
