import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PDP_E2E_PORT ?? 5173);
const HOST = process.env.PDP_E2E_HOST ?? "127.0.0.1";
const baseURL = process.env.PDP_BASE_URL ?? `http://${HOST}:${PORT}`;

export default defineConfig({
  timeout: 60_000,
  testDir: "tests/e2e",
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: process.env.CI ? [["html", { outputFolder: "reports/playwright" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PDP_BASE_URL
    ? undefined
    : {
        command: process.env.PDP_E2E_COMMAND ?? "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
      },
});


