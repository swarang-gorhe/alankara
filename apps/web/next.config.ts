import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@alankara/shared"],
  async rewrites() {
    return [
      { source: "/atelier", destination: "/admin" },
      { source: "/atelier/:path*", destination: "/admin/:path*" },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
