import { test as setup, loginNoise } from "./fixtures/test";
import { authFile } from "./client";
import { logIn } from "./fixtures/auth";

setup.use({ expectedAppError: loginNoise });

setup("log in through Keycloak", async ({ page }) => {
  await logIn(page);
  await page.context().storageState({ path: authFile });
});
