import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    pool: "forks",
    include: ['test\/*.?(c|m)[jt]s'],
    coverage: {
      enabled: true,
      clean: true,
      cleanOnRerun: true,
      provider: "istanbul",
      reporter: "lcov"
    }
  },
});