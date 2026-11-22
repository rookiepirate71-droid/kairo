import type { NextConfig } from "next";

const isPages = process.env.NEXT_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH || "/kairo";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.vercel.run", "vercel.run", "preview-check.vercel.run"],
  images: {
    qualities: [50, 65, 70, 85],
    // static export has no image optimizer server
    unoptimized: isPages || undefined,
  },
  reactStrictMode: true,
  ...(isPages
    ? {
        // keep the export build out of .next so the dev server's cache stays intact
        distDir: "dist-pages",
        output: "export",
        basePath,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
