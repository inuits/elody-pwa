import { test as base, expect } from "@playwright/test";
import { client } from "../client";
import { createEntity, deleteEntity, type CreatedEntity } from "./entities";
import { serveBuiltFrontend, usesBuiltFrontend } from "./frontend";

export const test = base.extend<{
  expectedAppError: RegExp | undefined;
  appErrors: string[];
  createdEntity: CreatedEntity;
}>({
  context: async ({ context }, use) => {
    if (usesBuiltFrontend) await serveBuiltFrontend(context);
    await use(context);
  },
  expectedAppError: [undefined, { option: true }],
  appErrors: [
    async ({ page, expectedAppError }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) =>
        errors.push(`pageerror: ${error.message}`),
      );
      page.on("console", (message) => {
        if (message.type() === "error")
          errors.push(`console: ${message.text()}`);
      });
      page.on("response", async (response) => {
        if (!response.url().includes("/api/graphql")) return;
        const body = await response.json().catch(() => null);
        if (body?.errors?.length)
          errors.push(`graphql: ${JSON.stringify(body.errors)}`);
      });

      await use(errors);

      const ignored = [
        ...(client.ignoredErrors ?? []),
        ...(expectedAppError ? [expectedAppError] : []),
      ];
      const unexpected = errors.filter(
        (error) => !ignored.some((pattern) => pattern.test(error)),
      );
      expect(unexpected, "unexpected app errors during the test").toEqual([]);
    },
    { auto: true },
  ],
  createdEntity: async ({ page }, use) => {
    const entity = await createEntity(page);
    try {
      await use(entity);
    } finally {
      await deleteEntity(page, entity.id);
    }
  },
});

export { expect };
export { client };
export { visibleResults } from "./entities";
export { logIn, loginNoise } from "./auth";
