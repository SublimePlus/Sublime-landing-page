import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Cloudflare Workers has no built-in next/image optimizer — the OpenNext
     * adapter routes optimization through Cloudflare Images, a separately
     * billed product. The four showcase images are hand-exported WebP/JPEG
     * totalling well under a megabyte, so they are served as-is from Workers
     * Assets instead. Revisit if user-supplied or much larger art appears.
     */
    unoptimized: true,
  },
};

export default nextConfig;
