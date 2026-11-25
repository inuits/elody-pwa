import { describe, expect, it, vi } from "vitest";
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

const setup = () => {
  const handle = vi.fn(
    () =>
      new Observable<FetchResult>((observer) => {
        observer.next({ data: { Entity: { id: "1", __typename: "Entity" } } });
        observer.complete();
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
});
