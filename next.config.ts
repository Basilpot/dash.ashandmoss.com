import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @repo/ui ships raw TSX; without this Next treats it as an external package
  // and fails to compile it.
  transpilePackages: ["@repo/ui"],
  turbopack: {
    // OpenNext sets outputFileTracingRoot to the app dir during its build and
    // Next rejects the build unless turbopack.root matches it exactly.
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3100",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN!,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
