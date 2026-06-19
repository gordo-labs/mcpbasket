import type { NextConfig } from "next";
import path from "node:path";

const turbopackRoot = process.env.VERCEL ? __dirname : path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
