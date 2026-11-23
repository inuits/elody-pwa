import { test, expect, client, visibleResults } from "../fixtures/test";

test("shows every client menu item", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  for (const label of client.menuItems)
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
});

test("opens each menu page without errors", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  for (const label of client.menuItems) {
    const link = navigation.getByRole("link", { name: label });
    const href = await link.getAttribute("href");
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByTestId("results-panel")).toBeVisible();
  }
});

test("opens an entity from a list", async ({ page }) => {
  await page.goto(`/${client.listEntityType}`);
  const firstItem = visibleResults(page).first();
  await expect(firstItem).toBeVisible();
  const url = page.url();
  await firstItem.click();
  await expect(page).not.toHaveURL(url);
});

test("pages to the next set of results", async ({ page }) => {
  await page.goto(`/${client.listEntityType}`);
  const first = visibleResults(page).first();
  const firstOnPageOne = await first.innerText();
  await page.getByTestId("pager-next").click();
  await expect(
    page.getByRole("spinbutton", { name: "Page number" }),
  ).toHaveValue("2");
  await expect(first).not.toHaveText(firstOnPageOne);
});
