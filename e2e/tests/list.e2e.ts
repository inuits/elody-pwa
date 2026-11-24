import type { Page } from "@playwright/test";
import { test, expect, client, visibleResults } from "../fixtures/test";

const firstLine = async (page: Page) =>
  (await visibleResults(page).first().innerText()).split("\n")[0].trim();

test.beforeEach(async ({ page }) => {
  await page.goto(`/${client.listEntityType}`);
  await expect(visibleResults(page).first()).toBeVisible();
});

test("sorts on another field and flips the direction", async ({ page }) => {
  await page.getByTestId("sort-options").click();
  await page
    .getByRole("option", { name: client.sortOption, exact: true })
    .click();
  await expect(page.getByTestId("sort-options")).toContainText(
    client.sortOption,
  );
  const firstBeforeFlip = await firstLine(page);

  const direction = page.getByTestId("sort-toggle");
  const directionLabel = await direction.getAttribute("aria-label");
  await direction.click();
  await expect(direction).not.toHaveAttribute("aria-label", directionLabel!);
  await expect.poll(() => firstLine(page)).not.toBe(firstBeforeFlip);
});

test("shows more results per page", async ({ page }) => {
  await expect(visibleResults(page)).toHaveCount(20);
  const pageCount = page.getByRole("navigation", { name: "Pagination" });
  const pagesBefore = await pageCount.innerText();

  await page.getByTestId("page-size").click();
  await page.getByRole("option", { name: "50", exact: true }).click();

  await expect(visibleResults(page)).toHaveCount(50);
  await expect(pageCount).not.toHaveText(pagesBefore);
});

test("switches to grid view and remembers its size", async ({ page }) => {
  const gridButton = page.getByRole("button", {
    name: "Grid view",
    exact: true,
  });
  const compactButton = page.getByRole("button", { name: "Compact grid view" });
  test.skip((await gridButton.count()) === 0, "client has no grid view");
  const firstInTable = await firstLine(page);

  await gridButton.click();
  await expect(gridButton).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByTestId("table-row").filter({ visible: true }),
  ).toHaveCount(0);
  await expect(page.getByTestId("grid-card-title-link").first()).toContainText(
    firstInTable,
  );

  await compactButton.click();
  await expect(compactButton).toHaveAttribute("aria-pressed", "true");
  await expect(gridButton).toHaveAttribute("aria-pressed", "false");

  await page.reload();
  await expect(compactButton).toHaveAttribute("aria-pressed", "true");
});
