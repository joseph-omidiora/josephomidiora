import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.js", "tests/a11y/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["components/**/*.js", "js/**/*.js", "scripts/**/*.js"],
      exclude: ["node_modules/**", "tests/**"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      reporter: ["text", "lcov"],
    },
    setupFiles: ["tests/fixtures/setup.js"],
  },
});
