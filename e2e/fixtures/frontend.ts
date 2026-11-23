import { existsSync, statSync } from "node:fs";
import path from "node:path";
import type { BrowserContext } from "@playwright/test";
import { client } from "../client";

export const distDir = path.join(import.meta.dirname, "../.dist");
export const usesBuiltFrontend = process.env.E2E_FRONTEND !== "dev";

export const serveBuiltFrontend = (context: BrowserContext) => {
  const origin = new URL(client.baseURL).origin;
  return context.route(
    (url) => url.origin === origin && !url.pathname.startsWith("/api"),
    (route) => {
      const { pathname } = new URL(route.request().url());
      const file = path.join(distDir, decodeURIComponent(pathname));
      const isFile =
        file.startsWith(distDir) && existsSync(file) && statSync(file).isFile();
      return route.fulfill({
        path: isFile ? file : path.join(distDir, "index.html"),
      });
    },
  );
};
