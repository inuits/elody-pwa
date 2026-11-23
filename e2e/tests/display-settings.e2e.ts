import { test, expect, client } from "../fixtures/test";
import type { Page } from "@playwright/test";

const bodyBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const rootFontSize = (page: Page) =>
  page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).fontSize),
  );

test.beforeEach(async ({ page }) => {
  await page.goto(`/${client.listEntityType}`);
  await expect(page.getByTestId("color-scheme-toggle")).toBeVisible();
});

test("switches between light and dark mode and remembers it", async ({
  page,
}) => {
  const toggle = page.getByTestId("color-scheme-toggle");
  const lightBackground = await bodyBackground(page);
  const lightLabel = await toggle.getAttribute("aria-label");

  await toggle.click();
  await expect.poll(() => bodyBackground(page)).not.toBe(lightBackground);
  await expect(toggle).not.toHaveAttribute("aria-label", lightLabel!);
  const darkBackground = await bodyBackground(page);

  await page.reload();
  await expect(toggle).toBeVisible();
  await expect.poll(() => bodyBackground(page)).toBe(darkBackground);

  await toggle.click();
  await expect.poll(() => bodyBackground(page)).toBe(lightBackground);
});

test("scales the UI and remembers it", async ({ page }) => {
  const baseSize = await rootFontSize(page);

  await page.getByTestId("ui-scale").click();
  await page.getByRole("menuitem", { name: "130%" }).click();
  await expect.poll(() => rootFontSize(page)).toBeCloseTo(baseSize * 1.3, 1);

  await page.reload();
  await expect(page.getByTestId("ui-scale")).toBeVisible();
  await expect.poll(() => rootFontSize(page)).toBeCloseTo(baseSize * 1.3, 1);
});

test("changes the language and remembers it", async ({ page }) => {
  const navigation = page.getByRole("navigation").first();
  const firstMenuItem = client.menuItems[0];
  await expect(
    navigation.getByRole("link", { name: firstMenuItem }),
  ).toBeVisible();

  const html = page.locator("html");
  const initialLang = await html.getAttribute("lang");
  const languageSelect = page.getByTestId("language-select");
  const currentLanguage = (await languageSelect.innerText()).trim();
  await languageSelect.click();
  await page
    .getByRole("option")
    .filter({ visible: true })
    .filter({ hasNotText: currentLanguage })
    .first()
    .click();

  await expect(
    navigation.getByRole("link", { name: firstMenuItem, exact: true }),
  ).toBeHidden();
  await expect(languageSelect).not.toHaveText(currentLanguage);
  await expect(html).not.toHaveAttribute("lang", initialLang!);

  await page.reload();
  await expect(languageSelect).toBeVisible();
  await expect(html).not.toHaveAttribute("lang", initialLang!);
  await expect(
    navigation.getByRole("link", { name: firstMenuItem, exact: true }),
  ).toBeHidden();
});
