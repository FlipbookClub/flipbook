import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import type { NextConfig } from "next";

// Pin Turbopack's workspace root to this directory. Without it, Next infers
// the root from the topmost lockfile (the Expo app at the repo root) and
// emits a warning. Resolving the path from this file keeps it correct
// regardless of where commands are invoked.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
