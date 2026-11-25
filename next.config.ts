import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No Cache Components: on Cloudflare Workers its `use cache` hangs the request (Next can't drive the runtime's
  // setTimeout), so every page fetches the team API on each request instead.
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
