"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type * as THREE from "three";

/**
 * Hybrid hero mascot: static 2D body image with a 3D head that follows the
 * cursor. The body is a transparent PNG rendered as an <img>, and the head is
 * a three.js canvas positioned over the neck opening.
 *
 * The head GLB is a standalone head-only model (no body geometry).
 * three.js is loaded at runtime from `/vendor/three-mascot.js` to keep it out
 * of the Next build.
 */
const HEAD_MODEL = "/mascot/head.glb";
const DRACO = "/draco/";

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

function initHead(mount: HTMLDivElement, V: Vendor): () => void {
  const { THREE, GLTFLoader, DRACOLoader } = V;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  mount.appendChild(renderer.domElement);

  // Lighting matched to the 2D body render
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

  let headPivot: THREE.Group | null = null;
  let raf = 0;
  let disposed = false;

  const YAW = 0.12;   // max head turn left/right (radians)
  const PITCH = 0.08;  // max head tilt up/down (radians)

  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  loader.load(HEAD_MODEL, (gltf) => {
    if (disposed) return;
    const headScene = gltf.scene;
    headScene.updateMatrixWorld(true);

    // Compute the bounding box of the entire head model
    const box = new THREE.Box3().setFromObject(headScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Create a pivot at the bottom-center of the head (the neck)
    const neckY = box.min.y;
    const neckX = center.x;
    const neckZ = center.z;

    headPivot = new THREE.Group();
    headPivot.position.set(0, 0, 0);

    // Offset the head scene so the neck is at the pivot origin
    headScene.position.set(-neckX, -neckY, -neckZ);
    headPivot.add(headScene);
    scene.add(headPivot);

    // Frame camera to show the head filling most of the canvas
    const headHeight = size.y;
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (headHeight * 1.1) / (2 * Math.tan(fov / 2));
    const camY = center.y - neckY;
    camera.position.set(0, camY, dist);
    camera.lookAt(0, camY, 0);
  });

  let last = performance.now();
  function animate(now: number) {
    raf = requestAnimationFrame(animate);
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (headPivot && !reduce) {
      // Cursor right → head looks right, cursor left → head looks left
      const targetYaw = pointer.x * YAW;
      // Cursor down → head looks down, cursor up → head looks up
      const targetPitch = pointer.y * PITCH;
      const k = 1 - Math.pow(0.001, delta);
      headPivot.rotation.y += (targetYaw - headPivot.rotation.y) * k;
      headPivot.rotation.x += (targetPitch - headPivot.rotation.x) * k;
    }
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(animate);

  function resize() {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
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

/**
 * The 3D head canvas, sized and positioned to sit on top of the 2D body's
 * neck opening.
 */
function Head3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      // @ts-expect-error runtime-only module served from /public
      const V = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "/vendor/three-mascot.js")) as Vendor;
      if (cancelled || !mountRef.current) return;
      cleanup = initHead(mount, V);
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

/**
 * The hybrid mascot: static 2D body with a 3D head overlaid at the neck.
 *
 * The 3D head canvas sits BEHIND the body image so the collar naturally
 * covers the raw bottom edge. The visible head pokes through the body
 * PNG's transparent neck opening.
 */
export function HeroMascotHybrid({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* 2D body — base layer */}
      <Image
        src="/mascot/mascot-body.png"
        alt=""
        width={1224}
        height={1285}
        className="relative z-10 w-full h-auto select-none"
        priority
        aria-hidden="true"
        draggable={false}
      />

      {/* 3D head — TOP layer, positioned flush on the neck/collar */}
      <Head3D className="absolute -top-[37%] left-1/2 -translate-x-[47%] w-[58%] aspect-square z-20" />
    </div>
  );
}
