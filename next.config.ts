import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.vercel.run", "vercel.run", "preview-check.vercel.run"],
  images: { qualities: [50, 65, 70, 85] },
  reactStrictMode: true,
};

export default nextConfig;
