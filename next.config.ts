import type { NextConfig } from "next";

import { NEXT_PUBLIC_IMAGE_DOMAIN, NEXT_PUBLIC_WEBSITE_DOMAIN } from "./lib/env";

const nextConfig: NextConfig = {
  // @repo/ui ships raw TSX; without this Next treats it as an external package
  // and fails to compile it.
  transpilePackages: ["@repo/ui"],
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
        hostname: NEXT_PUBLIC_IMAGE_DOMAIN,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: NEXT_PUBLIC_WEBSITE_DOMAIN,
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
