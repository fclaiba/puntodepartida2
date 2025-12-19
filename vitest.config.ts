import { defineConfig, defineProject } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "tests/e2e/**",
    ],
  },
  projects: [
    defineProject({
      test: {
        name: "backend",
        environment: "node",
        include: ["tests/backend/**/*.test.ts"],
        reporters: process.env.CI ? ["default", "junit"] : "default",
        outputFile: process.env.CI ? { junit: "reports/vitest-junit.xml" } : undefined,
        coverage: {
          reporter: ["text", "lcov"],
          reportsDirectory: "coverage",
          include: ["convex/**/*.ts"],
        },
      },
    }),
    defineProject({
      test: {
        name: "frontend",
        environment: "jsdom",
        include: ["tests/frontend/**/*.test.tsx"],
        setupFiles: ["./tests/frontend/setup.ts"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@convex/_generated/api": resolve(__dirname, "convex/_generated/api"),
      "@convex/_generated/dataModel": resolve(
        __dirname,
        "convex/_generated/dataModel"
      ),
    },
  },
});
