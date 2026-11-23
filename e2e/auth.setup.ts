import { test as setup } from "@playwright/test";
import { authFile } from "./client";
import { logIn } from "./fixtures/auth";

setup("log in through Keycloak", async ({ page }) => {
  await logIn(page);
  await page.context().storageState({ path: authFile });
});
