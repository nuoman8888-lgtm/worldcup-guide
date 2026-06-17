import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
