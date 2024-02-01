import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    pool: "forks",
    include: ['test\/*.?(c|m)[jt]s'],
    coverage: {
      provider: "istanbul",
      reporter: "lcov"
    }
  },
});