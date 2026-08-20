"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for the 3D mascot. WebGL and the GLB loader can't run on
 * the server, so the Canvas is pulled in with `ssr: false`.
 */
export const HeroMascot3D = dynamic(
  () => import("./HeroMascot3D").then((m) => m.HeroMascot3D),
  { ssr: false }
);
