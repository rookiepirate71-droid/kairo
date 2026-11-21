import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.vercel.run", "vercel.run", "preview-check.vercel.run"],
  reactStrictMode: true,
};

export default nextConfig;
