"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * 3D hero mascot with a head that turns toward the cursor.
 *
 * The GLB is a decomposed, draco-compressed model — thousands of little meshes
 * all sharing one material, named by region (BODY_*, HEAD_*, FACE_*, HAIR_*,
 * HEADPHONES_*). Rendering them individually would be thousands of draw calls,
 * so on load we bake each mesh's world transform into its geometry and merge
 * everything into just two meshes: a static body and a head. The head is
 * re-centred on the neck so it can pivot there, and each frame it eases toward
 * the pointer.
 */
const MODEL = "/mascot/mascot.glb";
// The GLB is draco-compressed. Serve the decoder from our own /public so the
// page never reaches out to the gstatic CDN (works offline and under strict CSP).
const DRACO = "/draco/";
const HEAD_PREFIXES = ["HEAD_", "FACE_", "HAIR_", "HEADPHONES_"];

// Framing / motion defaults. Overridable at runtime via the URL hash
// (e.g. #crop=0.6&yaw=0.5) so the look can be tuned without a rebuild.
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

useGLTF.preload(MODEL, DRACO);

function isHead(name: string) {
  return HEAD_PREFIXES.some((p) => name.startsWith(p));
}

function Mascot({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { scene } = useGLTF(MODEL, DRACO);
  const { camera } = useThree();
  // Client-only component (dynamic ssr:false), so it's safe to read the hash
  // during the first render via lazy init.
  const [params, setParams] = useState(readParams);

  useEffect(() => {
    const onHash = () => setParams(readParams());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const { bodyGeo, headGeo, material, neck, center, size } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const heads: THREE.BufferGeometry[] = [];
    const bodies: THREE.BufferGeometry[] = [];
    let material: THREE.Material | null = null;

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!material) material = mesh.material as THREE.Material;
      const g = mesh.geometry.clone();
      g.applyMatrix4(mesh.matrixWorld);
      // Drop attributes that differ between meshes so the merge succeeds.
      for (const key of Object.keys(g.attributes)) {
        if (!["position", "normal", "uv"].includes(key)) g.deleteAttribute(key);
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

    headGeo.computeBoundingBox();
    const hb = headGeo.boundingBox!;
    const neck = new THREE.Vector3(
      (hb.min.x + hb.max.x) / 2,
      hb.min.y,
      (hb.min.z + hb.max.z) / 2
    );
    // Re-centre the head on the neck so rotation pivots there.
    headGeo.translate(-neck.x, -neck.y, -neck.z);

    return { bodyGeo, headGeo, material: material!, neck, center, size };
  }, [scene]);

  // Frame the figure: fit the top `crop` fraction of its height into the view,
  // horizontally centred, with the head near the top. The outer group re-centres
  // the figure on the origin, so world-space top is +size.y/2.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = (cam.fov * Math.PI) / 180;
    const visibleH = size.y * params.crop;
    const dist = visibleH / (2 * Math.tan(fov / 2));
    const topY = size.y / 2 + size.y * params.top;
    const targetY = topY - visibleH / 2;
    cam.position.set(0, targetY, dist);
    cam.lookAt(0, targetY, 0);
    cam.updateProjectionMatrix();
  }, [camera, size, params]);

  const headGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = headGroup.current;
    if (!g) return;
    const targetYaw = pointer.current.x * params.yaw;
    const targetPitch = -pointer.current.y * params.pitch;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent easing
    g.rotation.y += (targetYaw - g.rotation.y) * k;
    g.rotation.x += (targetPitch - g.rotation.x) * k;
  });

  return (
    <group position={[-center.x, -center.y, -center.z]}>
      <mesh geometry={bodyGeo} material={material} />
      <group ref={headGroup} position={[neck.x, neck.y, neck.z]}>
        <mesh geometry={headGeo} material={material} />
      </group>
    </group>
  );
}

/** Tracks the pointer across the whole window, normalised to [-1, 1]. */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

function Rig() {
  const pointer = usePointer();
  return <Mascot pointer={pointer} />;
}

export function HeroMascot3D({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 32, position: [0, 0, 4] }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 6, 5]} intensity={1.5} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <Rig />
        </Suspense>
      </Canvas>
    </div>
  );
}
