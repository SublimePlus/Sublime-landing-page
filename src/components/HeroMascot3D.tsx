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
 * The GLB is a decomposed, uncompressed model (thousands of one-material
 * meshes named by region). On load we bake each mesh's world transform and
 * merge into two meshes: a static body and a head that pivots at the neck and
 * eases toward the pointer.
 */
const MODEL = "/mascot/mascot.glb";
const HEAD_PREFIXES = ["HEAD_", "FACE_", "HAIR_", "HEADPHONES_"];

const DEFAULTS = {
  crop: 0.72, // fraction of the figure height kept in view (half-body)
  top: 0.06, // headroom above the head, as a fraction of height
  yaw: 0.5, // max head turn left/right (radians)
  pitch: 0.32, // max head tilt up/down (radians)
};

function readParams() {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const p = new URLSearchParams(window.location.hash.slice(1));
  const num = (k: keyof typeof DEFAULTS) =>
    p.has(k) ? parseFloat(p.get(k)!) : DEFAULTS[k];
  return { crop: num("crop"), top: num("top"), yaw: num("yaw"), pitch: num("pitch") };
}

const isHead = (name: string) => HEAD_PREFIXES.some((p) => name.startsWith(p));

/** Shape of the self-hosted three bundle's exports. */
type Vendor = {
  THREE: typeof THREE;
  GLTFLoader: new () => {
    load(
      url: string,
      onLoad: (gltf: { scene: THREE.Object3D }) => void,
      onProgress?: unknown,
      onError?: (err: unknown) => void
    ): void;
  };
  mergeGeometries: (
    geometries: THREE.BufferGeometry[],
    useGroups?: boolean
  ) => THREE.BufferGeometry;
};

function initMascot(mount: HTMLDivElement, V: Vendor): () => void {
  const { THREE, GLTFLoader, mergeGeometries } = V;
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

  const loader = new GLTFLoader();

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
      const targetYaw = pointer.x * params.yaw;
      const targetPitch = -pointer.y * params.pitch;
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
