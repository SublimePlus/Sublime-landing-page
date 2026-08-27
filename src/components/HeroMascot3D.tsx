"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

/**
 * 3D hero mascot with a head that turns toward the cursor.
 *
 * three.js is NOT imported through Next here — it is loaded at runtime from a
 * self-hosted bundle at `/vendor/three-mascot.js` (built by
 * `scripts/build-vendor.mjs`). Bundling three through Next pushes the
 * production build past Vercel's 8 GB build machine and OOMs it; loading three
 * as a static asset keeps it out of the build entirely. Only TypeScript types
 * are imported from "three" below, and those are erased at build time.
 *
 * The GLB is a decomposed, draco-compressed model (thousands of one-material
 * meshes named by region). On load we bake each mesh's world transform and
 * merge into two meshes: a static body and a head that pivots at the neck and
 * eases toward the pointer.
 */
const MODEL = "/mascot/mascot.glb";
const DRACO = "/draco/";
const HEAD_PREFIXES = ["HEAD_", "FACE_", "HAIR_", "HEADPHONES_"];

// The source model's own naming is slightly wrong: these specific meshes are
// prefixed like head/headphones geometry but are actually part of the raised
// hand's pointing finger (confirmed by raycasting the live scene against the
// visible fingertip pixels — the finger sits close to the ear in this pose,
// so its vertices happen to fall inside the head's own bounding box, which
// is why a purely spatial check didn't catch them either). Force these into
// the static body group so the fingertip doesn't visually ride along with
// head rotation.
const FINGERTIP_MISNAMED = new Set([
  "HEADPHONES_759", "HEADPHONES_776", "HEADPHONES_758", "HEADPHONES_775",
  "HEADPHONES_780", "HEADPHONES_739", "HEADPHONES_777", "HEADPHONES_779",
  "HEADPHONES_743", "HEADPHONES_781", "HEADPHONES_760", "HEADPHONES_737",
  "HEADPHONES_782", "HEADPHONES_740", "HEADPHONES_767", "HEADPHONES_761",
  "HEADPHONES_738", "HEADPHONES_763", "HEADPHONES_748", "HEADPHONES_791",
  "HEADPHONES_745", "HEADPHONES_253", "HEADPHONES_246", "HEADPHONES_230",
  "HEADPHONES_247", "HEADPHONES_245", "HEADPHONES_762", "HEADPHONES_226",
  "HEADPHONES_248", "HEADPHONES_220", "HEADPHONES_262", "HEADPHONES_751",
  "HEADPHONES_277", "HEADPHONES_747", "HEADPHONES_752", "HEADPHONES_749",
  "HEADPHONES_771", "HEADPHONES_746", "HEADPHONES_264", "HEADPHONES_211",
  "HEADPHONES_266", "HEADPHONES_4758", "HEADPHONES_212", "HEADPHONES_210",
  "HEADPHONES_214", "HEADPHONES_251", "HEADPHONES_4750", "HEADPHONES_4751",
  "HEADPHONES_4784", "HEADPHONES_215", "HEADPHONES_5504", "HEADPHONES_107",
  "HEADPHONES_4796", "HEADPHONES_772", "HEADPHONES_770", "HEADPHONES_106",
  "HEADPHONES_105", "HEADPHONES_773", "HEADPHONES_769", "HEADPHONES_799",
  "FACE_111", "HEADPHONES_4806", "HEADPHONES_796", "HEAD_058",
  "HEADPHONES_092", "HEADPHONES_3520", "HEAD_094", "HEAD_110", "HEAD_099",
  "FACE_098", "HEAD_100", "HEAD_116", "FACE_4237", "HEAD_114", "HEAD_191",
  "FACE_166", "FACE_189", "HEAD_1731", "FACE_174", "FACE_5270", "FACE_662",
  "FACE_4072", "FACE_4749", "HEAD_664", "FACE_074", "FACE_4283",
  "FACE_5152", "FACE_5267", "FACE_4233", "FACE_5457", "FACE_5150",
  "FACE_4293", "FACE_4819", "FACE_4987", "FACE_4900", "FACE_175",
  "FACE_4394", "FACE_4986", "FACE_4747", "FACE_186", "FACE_2314",
  "FACE_4821", "FACE_4735",
]);

const DEFAULTS = {
  crop: 0.8, // fraction of figure height in view — upper/half-body, hoodie+hand visible
  top: 0.05, // headroom above the head, as a fraction of height
  yaw: 0.08, // max head turn left/right (radians) — kept tight: the raised
  // hand's geometry sits almost exactly at the neck pivot's height (its
  // fingertip is within ~0.05 units of the pivot), so at this mascot's scale
  // even a modest swing puts the helmet's lower rim close enough to the
  // static hand to visibly overlap it. Pixel-diffed screenshots at this
  // range to confirm the hand reads as static.
  pitch: 0.06, // max head tilt up/down (radians) — same reasoning as yaw.
};

function readParams() {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const p = new URLSearchParams(window.location.hash.slice(1));
  const num = (k: keyof typeof DEFAULTS) =>
    p.has(k) ? parseFloat(p.get(k)!) : DEFAULTS[k];
  return { crop: num("crop"), top: num("top"), yaw: num("yaw"), pitch: num("pitch") };
}

const isHead = (name: string) =>
  !FINGERTIP_MISNAMED.has(name) && HEAD_PREFIXES.some((p) => name.startsWith(p));

/** Shape of the self-hosted three bundle's exports. */
type Vendor = {
  THREE: typeof THREE;
  GLTFLoader: new () => {
    setDRACOLoader(loader: unknown): void;
    load(
      url: string,
      onLoad: (gltf: { scene: THREE.Object3D }) => void,
      onProgress?: unknown,
      onError?: (err: unknown) => void
    ): void;
  };
  DRACOLoader: new () => { setDecoderPath(path: string): void; dispose(): void };
  mergeGeometries: (
    geometries: THREE.BufferGeometry[],
    useGroups?: boolean
  ) => THREE.BufferGeometry;
};

function initMascot(mount: HTMLDivElement, V: Vendor): () => void {
  const { THREE, GLTFLoader, DRACOLoader, mergeGeometries } = V;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const params = readParams();
  const onHash = () => Object.assign(params, readParams());
  window.addEventListener("hashchange", onHash);

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

  let headGroup: THREE.Group | null = null;
  let figureHeight = 1;
  let raf = 0;
  let disposed = false;

  function frame() {
    const fov = (camera.fov * Math.PI) / 180;
    const visibleH = figureHeight * params.crop;
    const dist = visibleH / (2 * Math.tan(fov / 2));
    const topY = figureHeight / 2 + figureHeight * params.top;
    const targetY = topY - visibleH / 2;
    camera.position.set(0, targetY, dist);
    camera.lookAt(0, targetY, 0);
  }

  function resize() {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    frame();
  }

  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  loader.load(MODEL, (gltf) => {
    if (disposed) return;
    gltf.scene.updateMatrixWorld(true);
    const heads: THREE.BufferGeometry[] = [];
    const bodies: THREE.BufferGeometry[] = [];
    let material: THREE.Material | null = null;

    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!material) material = mesh.material as THREE.Material;
      const g = mesh.geometry.clone();
      g.applyMatrix4(mesh.matrixWorld);
      for (const attr of Object.keys(g.attributes)) {
        if (!["position", "normal", "uv"].includes(attr)) g.deleteAttribute(attr);
      }
      (isHead(mesh.name) ? heads : bodies).push(g);
    });

    const headGeo = mergeGeometries(heads, false);
    const bodyGeo = mergeGeometries(bodies, false);

    const full = mergeGeometries([headGeo.clone(), bodyGeo.clone()], false);
    full.computeBoundingBox();
    const center = new THREE.Vector3();
    full.boundingBox!.getCenter(center);
    const size = new THREE.Vector3();
    full.boundingBox!.getSize(size);
    figureHeight = size.y;

    headGeo.computeBoundingBox();
    const hb = headGeo.boundingBox!;
    const neck = new THREE.Vector3(
      (hb.min.x + hb.max.x) / 2,
      hb.min.y,
      (hb.min.z + hb.max.z) / 2
    );
    headGeo.translate(-neck.x, -neck.y, -neck.z);

    const root = new THREE.Group();
    root.position.set(-center.x, -center.y, -center.z);
    root.add(new THREE.Mesh(bodyGeo, material!));
    headGroup = new THREE.Group();
    headGroup.position.copy(neck);
    headGroup.add(new THREE.Mesh(headGeo, material!));
    root.add(headGroup);
    scene.add(root);
    frame();
  });

  let last = performance.now();
  function animate(now: number) {
    raf = requestAnimationFrame(animate);
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (headGroup && !reduce) {
      // Head looks toward the cursor. Pitch (up/down) is correct as-is;
      // yaw (left/right) needed its sign flipped back the other way — cursor
      // left must turn the head left, cursor right must turn it right.
      const targetYaw = pointer.x * params.yaw;
      const targetPitch = pointer.y * params.pitch;
      const k = 1 - Math.pow(0.001, delta);
      headGroup.rotation.y += (targetYaw - headGroup.rotation.y) * k;
      headGroup.rotation.x += (targetPitch - headGroup.rotation.x) * k;
    }
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(animate);

  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("hashchange", onHash);
    window.removeEventListener("pointermove", onMove);
    draco.dispose();
    renderer.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[];
        (Array.isArray(m) ? m : [m]).forEach((mat) => mat.dispose());
      }
    });
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
  };
}

export function HeroMascot3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      // Runtime import of the self-hosted, pre-built bundle. The bundler is told
      // to ignore it so three is never compiled into the Next build.
      // @ts-expect-error runtime-only module served from /public (not resolvable at build)
      const V = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "/vendor/three-mascot.js")) as Vendor;
      if (cancelled || !mountRef.current) return;
      cleanup = initMascot(mount, V);
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
