"use client";

import { useEffect, useRef } from "react";

/**
 * 3D hero mascot with a head that turns toward the cursor.
 *
 * This component has zero compile-time dependency on three.js, the GLB, or
 * the draco decoder — it only renders a container and, after mount, loads a
 * static runtime script from /public that does the actual work. Bundling
 * three.js (and the client-side module graph it pulls in) through Next's
 * client webpack compiler was pushing the production build far past Vercel's
 * build machine and OOMing it; a static runtime the browser fetches after
 * the page loads keeps Next's compiler from ever seeing three.js at all.
 *
 * See public/mascot/mascot-runtime.js for the actual scene/camera/lighting
 * setup, GLTFLoader + DRACOLoader loading, the head/body merge, and the
 * pointer-tracking animation loop — this file used to contain all of that
 * directly; the behavior is unchanged, only its location moved.
 */
const RUNTIME = "/mascot/mascot-runtime.js";

export function HeroMascot3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      // Runtime import of a static, non-TypeScript file served from /public.
      // The bundler is told to ignore it so nothing it pulls in (three.js,
      // the vendor bundle, the GLB) is ever compiled into the Next build.
      // Importing via a variable (rather than a string literal) means
      // TypeScript treats the result as `any` — nothing to resolve at build time.
      const { initHeroMascot } = await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */ RUNTIME
      );
      if (cancelled || !mountRef.current) return;
      cleanup = await initHeroMascot(mount);
      if (cancelled) cleanup();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
