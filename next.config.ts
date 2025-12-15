import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "spltransportation.com.au",
          },
        ],
        destination: "https://www.spltransportation.com.au/:path*",
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
