import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the parent home directory can make Next.js infer the
  // whole user folder as its workspace, multiplying watcher and cache usage.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
