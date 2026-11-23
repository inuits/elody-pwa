import { expect, type Page } from "@playwright/test";
import { client } from "../client";
import { usesBuiltFrontend } from "./frontend";

export const loginNoise = /status of 401|Failed to load module script/;

export const logIn = async (page: Page) => {
  const { E2E_USERNAME, E2E_PASSWORD } = process.env;
  if (!E2E_USERNAME || !E2E_PASSWORD)
    throw new Error("Set E2E_USERNAME and E2E_PASSWORD in e2e/.env");

  await page.goto("/");
  await page.getByLabel("Username or email").fill(E2E_USERNAME);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => url.origin === new URL(client.baseURL).origin);
  if (usesBuiltFrontend) await page.reload();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
};
