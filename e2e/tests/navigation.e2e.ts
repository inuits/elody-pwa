import type { Page } from "@playwright/test";
import {
  test,
  expect,
  client,
  visibleResults,
  logIn,
  loginNoise,
} from "../fixtures/test";

const openFirstResult = async (page: Page) => {
  await page.goto(`/${client.listEntityType}`);
  await visibleResults(page).first().click();
  await expect(page).not.toHaveURL(new RegExp(`/${client.listEntityType}$`));
};

test("steps to the next and previous result from the detail page", async ({
  page,
}) => {
  await openFirstResult(page);
  const firstUrl = page.url();
  const position = page.getByRole("group", {
    name: "Position in the result list",
  });
  const previous = position.getByRole("button", { name: "Open previous" });
  const next = position.getByRole("button", { name: "Open next" });
  await expect(previous).toBeDisabled();
  await expect(position.getByRole("status")).toHaveText(/^1\D/);

  await next.click();
  await expect(page).not.toHaveURL(firstUrl);
  await expect(position.getByRole("status")).toHaveText(/^2\D/);
  await expect(previous).toBeEnabled();

  await previous.click();
  await expect(page).toHaveURL(firstUrl);
});

test("returns to the list page it came from through the breadcrumb", async ({
  page,
}) => {
  test.fixme(
    true,
    "app bug: going back through the breadcrumb sometimes reloads page 1 (getEntities sent with skip=1) although page 2 is stored",
  );
  await page.goto(`/${client.listEntityType}`);
  const firstRow = visibleResults(page).first();
  const firstOnPageOne = await firstRow.innerText();
  await page.getByTestId("pager-next").click();
  const pageNumber = page.getByRole("spinbutton", { name: "Page number" });
  await expect(pageNumber).toHaveValue("2");
  await expect(firstRow).not.toHaveText(firstOnPageOne);

  await visibleResults(page).first().click();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toBeVisible();
  await page.mouse.move(0, 0);
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link")
    .first()
    .click();

  await expect(page).toHaveURL(new RegExp(`/${client.listEntityType}`));
  await expect(pageNumber).toHaveValue("2");
});

test.describe("unknown entity", () => {
  test.use({ expectedAppError: /404: NOT FOUND|status of 404/ });

  test("shows a not found page", async ({ page }) => {
    await openFirstResult(page);
    await page.goto(page.url().replace(/[^/]+$/, "e2e-does-not-exist"));

    await expect(
      page.getByRole("heading", { name: /couldn't find/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /go back home/i }),
    ).toBeVisible();
  });
});

test.describe("with its own session", () => {
  test.use({
    storageState: { cookies: [], origins: [] },
    expectedAppError: new RegExp(`${loginNoise.source}|NO VALID TOKEN`),
  });

  test("logs out and has to log in again", async ({ page }) => {
    await logIn(page);
    await page.getByRole("button", { name: "Log out" }).click();
    await page
      .getByRole("dialog", { name: "Logout" })
      .getByRole("button", { name: "Confirm" })
      .click();

    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await page.goto(`/${client.listEntityType}`);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
