import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;

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
          background: "linear-gradient(135deg, #1b3a2f 0%, #3c866b 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#ffffff" }}>
            Sublime
          </span>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#c9f24e" }}>+</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            lineHeight: 1.25,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 900,
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            marginTop: 48,
            width: 120,
            height: 8,
            borderRadius: 4,
            background: "#c9f24e",
          }}
        />
      </div>
    ),
    size,
  );
}
