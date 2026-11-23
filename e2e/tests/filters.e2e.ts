import type { Page } from "@playwright/test";
import { test, expect, client, visibleResults } from "../fixtures/test";

const { filters } = client;

const resultCount = async (page: Page) =>
  Number(
    (await page.getByTestId("list-count-chip").innerText()).replace(/\D/g, ""),
  );

const openFilter = async (page: Page, label: string) => {
  await page.goto(`/${client.listEntityType}`);
  await expect(page.getByTestId("list-count-chip")).toBeVisible();
  await page.getByTestId("filters-toggle").click();
  const pane = page.getByRole("complementary", { name: "Filters" });
  await pane.getByRole("button", { name: label, exact: true }).click();
  return pane;
};

const apply = (pane: ReturnType<Page["getByRole"]>) =>
  pane.getByRole("button", { name: "Apply filter(s)" }).click();

test("filters on text with the contains and is exactly matchers", async ({
  page,
  createdEntity,
}) => {
  const pane = await openFilter(page, filters.text);
  const keyword = pane.getByRole("textbox", { name: "keyword" });

  await keyword.fill(createdEntity.title);
  await apply(pane);
  await expect(visibleResults(page)).toHaveCount(1);
  await expect(visibleResults(page).first()).toContainText(createdEntity.title);

  await pane.getByRole("combobox", { name: "contains text" }).click();
  await page.getByRole("option", { name: "is exactly" }).click();
  await keyword.fill(createdEntity.title.slice(0, -2));
  await apply(pane);
  await expect(visibleResults(page)).toHaveCount(0);

  await keyword.fill(createdEntity.title);
  await apply(pane);
  await expect(visibleResults(page)).toHaveCount(1);
});

test("filters on checkbox options and clears them", async ({ page }) => {
  const [first, second] = filters.checkbox.options;
  const pane = await openFilter(page, filters.checkbox.label);
  const total = await resultCount(page);

  await pane.getByRole("checkbox", { name: first, exact: true }).check();
  await apply(pane);
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  const firstOnly = await resultCount(page);
  expect(firstOnly).toBeGreaterThan(0);
  for (const row of await visibleResults(page).all())
    await expect(row).toContainText(new RegExp(first, "i"));

  await pane.getByRole("checkbox", { name: second, exact: true }).check();
  await apply(pane);
  await expect.poll(() => resultCount(page)).toBeGreaterThan(firstOnly);
  const both = await resultCount(page);

  await pane.getByRole("button", { name: "Clear all" }).click();
  await expect.poll(() => resultCount(page)).toBeGreaterThan(both);
});

test("filters on a date", async ({ page, createdEntity }) => {
  const pane = await openFilter(page, filters.date);
  const total = await resultCount(page);
  const today = new Date();
  const date = [today.getDate(), today.getMonth() + 1]
    .map((part) => String(part).padStart(2, "0"))
    .concat(String(today.getFullYear()))
    .join("/");

  await pane.getByRole("textbox", { name: "Datepicker input" }).fill(date);
  await page.keyboard.press("Enter");
  await apply(pane);
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  await expect(
    visibleResults(page).filter({ hasText: createdEntity.title }),
  ).toHaveCount(1);
});
