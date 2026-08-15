"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import Image from "next/image";

const SPRING = { stiffness: 150, damping: 20, mass: 0.5 };

export function Mascot3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rawRotateY = useTransform(mouseX, [-0.5, 0.5], [-18, 18]);
  const rawRotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);

  const rotateX = useSpring(rawRotateX, SPRING);
  const rotateY = useSpring(rawRotateY, SPRING);

  const shadowX = useTransform(rotateY, [-18, 18], [20, -20]);
  const shadowY = useTransform(rotateX, [-12, 12], [-10, 20]);
  const shadowBlur = useTransform(rotateX, [-12, 0, 12], [25, 40, 25]);
  const shadowFilter = useMotionTemplate`blur(${shadowBlur}px)`;

  const glowX = useTransform(mouseX, [-0.5, 0.5], [35, 65]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [30, 70]);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(201,242,78,0.25) 0%, rgba(60,134,107,0.15) 40%, transparent 70%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(nx);
      mouseY.set(ny);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center"
      style={{ perspective: 800 }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full sm:h-80 sm:w-80"
        style={{ background: glowBg }}
        animate={{
          scale: isHovering ? 1.15 : 1,
          opacity: isHovering ? 1 : 0.7,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-18px] h-6 w-40 rounded-[50%] bg-black/30 sm:w-52"
        style={{ x: shadowX, y: shadowY, filter: shadowFilter }}
        animate={{ scaleX: isHovering ? 1.1 : 0.95 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="relative z-10"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <motion.div
          animate={{ scale: isHovering ? 1.06 : 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Image
            src="/mascot.jpg"
            alt="Sublime+ mascot"
            width={340}
            height={420}
            priority
            className="pointer-events-none select-none drop-shadow-2xl"
            style={{ transform: "translateZ(40px)" }}
          />
        </motion.div>

        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute rounded-full bg-lime"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              transform: `translateZ(${p.z}px)`,
              opacity: 0.6,
            }}
            animate={{
              y: [0, p.drift, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

const PARTICLES = [
  { id: 1, size: 5, top: "10%", left: "15%", z: 60, drift: -12, duration: 3, delay: 0 },
  { id: 2, size: 3, top: "25%", left: "80%", z: 50, drift: -8, duration: 4, delay: 0.5 },
  { id: 3, size: 4, top: "70%", left: "10%", z: 70, drift: -15, duration: 3.5, delay: 1 },
  { id: 4, size: 6, top: "60%", left: "85%", z: 45, drift: -10, duration: 2.8, delay: 0.3 },
  { id: 5, size: 3, top: "40%", left: "5%", z: 55, drift: -6, duration: 4.5, delay: 0.8 },
  { id: 6, size: 4, top: "15%", left: "70%", z: 65, drift: -14, duration: 3.2, delay: 1.2 },
];
