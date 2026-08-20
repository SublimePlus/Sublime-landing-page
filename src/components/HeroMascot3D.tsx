"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * 3D hero mascot with a head that turns toward the cursor.
 *
 * Written against plain three.js (no react-three-fiber / drei) deliberately:
 * those libraries are heavy to bundle and this only needs to load one GLB and
 * rotate one group, so the raw renderer keeps both the build and the shipped
 * payload small.
 *
 * The GLB is a decomposed, draco-compressed model — thousands of little meshes
 * sharing one material, named by region (BODY_*, HEAD_*, FACE_*, HAIR_*,
 * HEADPHONES_*). On load we bake each mesh's world transform and merge into two
 * meshes: a static body and a head that pivots at the neck and eases toward the
 * pointer each frame.
 */
const MODEL = "/mascot/mascot.glb";
// The GLB is draco-compressed. Serve the decoder from /public so the page never
// reaches the gstatic CDN (works offline and under strict CSP).
const DRACO = "/draco/";
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

function isHead(name: string) {
  return HEAD_PREFIXES.some((p) => name.startsWith(p));
}

export function HeroMascot3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
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

    // Pointer offset from screen centre, normalised to [-1, 1].
    const pointer = { x: 0, y: 0 };
    function onMove(e: PointerEvent) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    let headGroup: THREE.Group | null = null;
    let disposed = false;
    let raf = 0;

    // Frame the figure: fit the top `crop` fraction of its height into view,
    // centred, head near the top.
    function frame(sizeY: number) {
      const fov = (camera.fov * Math.PI) / 180;
      const visibleH = sizeY * params.crop;
      const dist = visibleH / (2 * Math.tan(fov / 2));
      const topY = sizeY / 2 + sizeY * params.top;
      const targetY = topY - visibleH / 2;
      camera.position.set(0, targetY, dist);
      camera.lookAt(0, targetY, 0);
    }

    let figureHeight = 1;

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
      const box = full.boundingBox!;
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
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
      frame(figureHeight);
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

    const ro = new ResizeObserver(() => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      frame(figureHeight);
    });
    ro.observe(mount);

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
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
