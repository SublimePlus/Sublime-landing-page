// Pre-bundles three.js and the GLTF/DRACO loaders into a single self-hosted ES
// module served from /public/vendor. The hero loads this at runtime instead of
// importing three through Next, which keeps three out of the Next build — that
// build otherwise peaks well over Vercel's 8 GB build machine and OOMs.
//
// Regenerate after bumping three: `npm run build:vendor`.
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await build({
  stdin: {
    contents: `
      export * as THREE from "three";
      export { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
      export { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
      export { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
    `,
    resolveDir: root,
    loader: "js",
  },
  bundle: true,
  format: "esm",
  minify: true,
  legalComments: "none",
  outfile: path.join(root, "public/vendor/three-mascot.js"),
});

console.log("Built public/vendor/three-mascot.js");
