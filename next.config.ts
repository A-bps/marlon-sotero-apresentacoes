import type { NextConfig } from "next";

// A Content-Security-Policy é definida em src/proxy.ts (precisa de nonce por requisição).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

// Prévia estática para o GitHub Pages (PAGES=1): sem servidor, sem API e sem cabeçalhos próprios.
const pages = process.env.PAGES
  ? { output: "export" as const, basePath: process.env.NEXT_PUBLIC_BASE_PATH, trailingSlash: true, images: { unoptimized: true } }
  : {};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  ...(process.env.PAGES
    ? {}
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
  ...pages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
