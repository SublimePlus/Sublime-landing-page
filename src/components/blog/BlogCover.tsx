import { PlusMark } from "../PlusMark";
import type { PostTone } from "@/lib/blog";

/**
 * Generated cover art for a post.
 *
 * The earlier blog hot-linked Unsplash photography as a placeholder. That is a
 * worse option now than it was then: `next.config.ts` sets
 * `images.unoptimized` because Cloudflare Workers has no image optimizer, so a
 * remote photo would be fetched from a third party at full size on every view.
 * Brand gradients cost nothing, ship no requests, and cannot rot — and there is
 * no placeholder-art debt to pay off later if real art never arrives.
 *
 * Deterministic and server-rendered: no client JS, no hydration surface.
 */
const GRADIENTS: Record<PostTone, string> = {
  teal: "from-pine via-teal to-teal-dark",
  pine: "from-night via-pine to-teal-dark",
  lime: "from-pine via-teal-dark to-teal",
};

/** Coprime steps, so the marks scatter instead of landing on a grid. */
const MARKS = Array.from({ length: 14 }, (_, i) => ({
  top: `${(i * 37 + 9) % 92}%`,
  left: `${(i * 53 + 5) % 94}%`,
  size: 10 + ((i * 7) % 4) * 7,
  rotate: ((i * 29) % 50) - 25,
  opacity: 0.12 + ((i * 11) % 5) * 0.06,
}));

export function BlogCover({
  tone,
  className = "",
  badgeSize = "sm",
}: {
  tone: PostTone;
  className?: string;
  badgeSize?: "sm" | "lg";
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${GRADIENTS[tone]} ${className}`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        {MARKS.map((mark, i) => (
          <PlusMark
            key={i}
            className="absolute text-lime"
            strokeWidth={3}
            style={{
              top: mark.top,
              left: mark.left,
              width: mark.size,
              height: mark.size,
              opacity: mark.opacity,
              transform: `rotate(${mark.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* Anchors the composition and keeps the plus-mark motif consistent with
          the cards and badges used across the rest of the site. */}
      <span
        className={`absolute z-10 flex items-center justify-center rounded-lg bg-lime text-pine ${
          badgeSize === "lg" ? "right-4 top-4 h-9 w-9" : "right-3 top-3 h-8 w-8"
        }`}
      >
        <PlusMark
          className={badgeSize === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"}
          strokeWidth={3}
        />
      </span>
    </div>
  );
}
