import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./sanityImageLoader.ts",
  },
};

export default nextConfig;
