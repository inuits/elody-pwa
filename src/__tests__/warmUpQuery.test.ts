import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  gql,
  type FetchResult,
} from "@apollo/client/core";
import { warmUpLink, warmUpQueries } from "@/warmUpQuery";

const entityQuery = gql`
  query getEntityById($id: String!) {
    Entity(id: $id) {
      id
    }
  }
`;

const setup = (delay = 0) => {
  const handle = vi.fn(
    () =>
      new Observable<FetchResult>((observer) => {
        setTimeout(() => {
          observer.next({
            data: { Entity: { id: "1", __typename: "Entity" } },
          });
          observer.complete();
        }, delay);
      }),
  );
  const client = new ApolloClient({
    link: ApolloLink.from([warmUpLink, new ApolloLink(handle)]),
    cache: new InMemoryCache(),
  });
  return { client, handle };
};

describe("warmUpQueries", () => {
  it("prepares a query without sending it", async () => {
    const { client, handle } = setup();
    await warmUpQueries(client, [entityQuery]);
    expect(handle).not.toHaveBeenCalled();
  });

  it("leaves real queries alone", async () => {
    const { client, handle } = setup();
    await warmUpQueries(client, [entityQuery]);
    const result = await client.query({
      query: entityQuery,
      variables: { id: "1" },
      fetchPolicy: "no-cache",
    });
    expect(handle).toHaveBeenCalledTimes(1);
    expect(result.data.Entity.id).toBe("1");
  });

  describe("while other requests are running", () => {
    afterEach(() => vi.useRealTimers());

    it("waits until requests have been quiet for a while", async () => {
      vi.useFakeTimers();
      const { client } = setup(1000);
      const prepare = vi.spyOn(client, "query");
      client
        .query({
          query: entityQuery,
          variables: { id: "2" },
          fetchPolicy: "no-cache",
        })
        .catch(() => undefined);
      const warmUp = warmUpQueries(client, [entityQuery], 500);
      await vi.advanceTimersByTimeAsync(1200);
      expect(prepare).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(3000);
      await warmUp;
      expect(prepare).toHaveBeenCalledTimes(2);
    });
  });
});
