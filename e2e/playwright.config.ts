import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const envFile = path.join(import.meta.dirname, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const { client, clientDir, authFile } = await import("./client");
const { distDir, usesBuiltFrontend } = await import("./fixtures/frontend");

if (usesBuiltFrontend && !existsSync(path.join(distDir, "index.html")))
  throw new Error(
    "No built frontend in e2e/.dist: run `pnpm build` in e2e/, or set E2E_FRONTEND=dev to test against the Vite dev server.",
  );

export default defineConfig({
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: client.baseURL,
    testIdAttribute: "data-cy",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "generic",
      testDir: "./tests",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: authFile },
    },
    {
      name: "client",
      testDir: path.join(clientDir, "tests"),
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: authFile },
    },
    { name: "setup", testDir: ".", testMatch: "auth.setup.ts" },
    ...(process.env.E2E_PERF
      ? [
          {
            name: "perf",
            testDir: "./perf",
            testMatch: "**/*.perf.ts",
            dependencies: ["setup"],
            use: { ...devices["Desktop Chrome"], storageState: authFile },
          },
        ]
      : []),
  ],
});
