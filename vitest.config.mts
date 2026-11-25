import { defineConfig } from "vitest/config";

// only the pure data-shaping code is tested; pages are covered by `npm run build`
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
