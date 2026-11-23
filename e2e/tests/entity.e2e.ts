import { test, expect, client, visibleResults } from "../fixtures/test";

const field = client.editableTextField;

test("creates an entity and opens it", async ({ page, createdEntity }) => {
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toContainText(createdEntity.title);
});

test("finds a new entity with simple search", async ({
  page,
  createdEntity,
}) => {
  await page.goto(`/${client.listEntityType}`);
  await page
    .getByTestId("simple-search")
    .getByRole("textbox")
    .fill(createdEntity.title);
  await page.keyboard.press("Enter");
  await expect(visibleResults(page)).toHaveCount(1);
  await expect(visibleResults(page).first()).toContainText(createdEntity.title);
});

test("saves an inline edit with Enter", async ({ page, createdEntity }) => {
  await page.getByRole("button", { name: `${field}, edit` }).click();
  await page
    .getByRole("textbox", { name: field })
    .fill(`saved ${createdEntity.title}`);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: `${field}, edit` }),
  ).toContainText(`saved ${createdEntity.title}`);

  await page.reload();
  await expect(
    page.getByRole("button", { name: `${field}, edit` }),
  ).toContainText(`saved ${createdEntity.title}`);
});

test("cancels an inline edit with Esc", async ({ page, createdEntity }) => {
  await page.getByRole("button", { name: `${field}, edit` }).click();
  await page
    .getByRole("textbox", { name: field })
    .fill(`cancelled ${createdEntity.title}`);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: `${field}, edit` }),
  ).not.toContainText("cancelled");

  await page.reload();
  await expect(
    page.getByRole("button", { name: `${field}, edit` }),
  ).not.toContainText("cancelled");
});

test("saves the open edited field when leaving the page", async ({
  page,
  createdEntity,
}) => {
  const detailUrl = page.url();
  await page.getByRole("button", { name: `${field}, edit` }).click();
  await page
    .getByRole("textbox", { name: field })
    .fill(`left ${createdEntity.title}`);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: client.menuItems[0] })
    .click();
  await expect(page).not.toHaveURL(detailUrl);

  await page.goBack();
  await expect(page).toHaveURL(detailUrl);
  await expect(
    page.getByRole("button", { name: `${field}, edit` }),
  ).toContainText(`left ${createdEntity.title}`);
});
