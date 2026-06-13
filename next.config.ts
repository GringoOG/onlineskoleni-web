import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/hrbek-learning",
        destination: "/hrbek-learning/index.html",
      },
      {
        source: "/hrbek-learning/",
        destination: "/hrbek-learning/index.html",
      },
    ];
  },
};

export default nextConfig;
