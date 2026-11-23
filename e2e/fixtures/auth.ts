import { expect, type Page } from "@playwright/test";

export const logIn = async (page: Page) => {
  const { E2E_USERNAME, E2E_PASSWORD } = process.env;
  if (!E2E_USERNAME || !E2E_PASSWORD)
    throw new Error("Set E2E_USERNAME and E2E_PASSWORD in e2e/.env");

  await page.goto("/");
  await page.getByLabel("Username or email").fill(E2E_USERNAME);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
};
