import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography is still hot-linked from Unsplash. Routing it
    // through next/image means it is at least resized, converted to AVIF/WebP
    // and served with explicit dimensions, so it no longer shifts layout.
    // These entries come out when the images are replaced with self-hosted art.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
