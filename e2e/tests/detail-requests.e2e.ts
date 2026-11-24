import { test, expect, client } from "../fixtures/test";
import { trackGraphql } from "../fixtures/graphqlTraffic";

test("loads the detail page within its GraphQL request budget", async ({
  page,
  createdEntity,
}) => {
  test.skip(!client.detailRequestBudget, "no detailRequestBudget set");
  await expect(page).toHaveURL(new RegExp(createdEntity.id));
  const traffic = trackGraphql(page);

  await page.reload();
  await traffic.settled();

  const operations = traffic.calls.map((call) => call.name).sort();
  expect(
    operations.length,
    `GraphQL operations:\n${operations.join("\n")}`,
  ).toBeLessThanOrEqual(client.detailRequestBudget!);
});
