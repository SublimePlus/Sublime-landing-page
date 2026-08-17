import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time so the social card can never drift out of sync with
 * the brand, and nobody has to maintain a hand-exported PNG.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0E1F19 0%, #1B3A2F 55%, #3C866B 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            fontWeight: 700,
            color: "#C9F24E",
          }}
        >
          Sublime
          <span style={{ fontSize: 22, marginTop: -14 }}>+</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Your content and socials, handled like a creative partner.
        </div>
        <div style={{ marginTop: 32, fontSize: 28, color: "rgba(255,255,255,0.72)" }}>
          {site.tagline}
        </div>
      </div>
    ),
    size
  );
}
