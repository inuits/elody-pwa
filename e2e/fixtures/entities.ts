import { expect, type Page } from "@playwright/test";
import { client } from "../client";

export type CreatedEntity = { id: string; title: string };

export const visibleResults = (page: Page) =>
  page
    .getByTestId("list-item")
    .or(page.getByTestId("table-row"))
    .filter({ visible: true });

export const createEntity = async (page: Page): Promise<CreatedEntity> => {
  const { dialogName, pickFirstOption, titleField } = client.create;
  const title = `e2e ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  await page.goto(`/${client.listEntityType}`);
  await page.getByTestId("page-header-create").click();
  const dialog = page.getByRole("dialog", { name: dialogName });
  for (const name of pickFirstOption) {
    await dialog.getByRole("combobox", { name }).click();
    await page.getByRole("option").filter({ visible: true }).first().click();
  }
  await dialog.getByRole("textbox", { name: titleField }).fill(title);
  const listUrl = page.url();
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(page).not.toHaveURL(listUrl);
  await expect(dialog).toBeHidden();

  return { id: new URL(page.url()).pathname.split("/").pop()!, title };
};

export const deleteEntity = (page: Page, id: string) =>
  page.evaluate(async (id) => {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Apollo-Require-Preflight": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query:
          "mutation deleteData($id: String!, $path: Collection!, $deleteMediafiles: Boolean!) { deleteData(id: $id, path: $path, deleteMediafiles: $deleteMediafiles) }",
        variables: { id, path: "entities", deleteMediafiles: false },
      }),
    });
    if (!response.ok) throw new Error(`deleteData ${id}: ${response.status}`);
  }, id);
