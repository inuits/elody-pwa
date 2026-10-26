import { describe, expect, it } from "vitest";
import {
  ApolloLink,
  Observable,
  execute,
  gql,
  type FetchResult,
} from "@apollo/client/core";
import { SESSION_HEADER, createSessionLink } from "@/observability/sessionLink";

const headersSent = (link: ApolloLink): Promise<Record<string, string>> =>
  new Promise((resolve) => {
    const terminal = new ApolloLink(
      (operation) =>
        new Observable<FetchResult>((observer) => {
          resolve(operation.getContext().headers ?? {});
          observer.next({ data: {} });
          observer.complete();
        }),
    );
    execute(ApolloLink.from([link, terminal]), {
      query: gql`
        query getEntities {
          Entities {
            count
          }
        }
      `,
    }).subscribe({});
  });

describe("createSessionLink", () => {
  it("tells the GraphQL server which browser tab sent the request", async () => {
    const headers = await headersSent(createSessionLink("s-1"));
    expect(headers[SESSION_HEADER]).toBe("s-1");
  });

  it("keeps the headers set before it", async () => {
    const auth = new ApolloLink((operation, forward) => {
      operation.setContext({ headers: { authorization: "Bearer x" } });
      return forward(operation);
    });
    const headers = await headersSent(
      ApolloLink.from([auth, createSessionLink("s-1")]),
    );
    expect(headers).toEqual({
      authorization: "Bearer x",
      [SESSION_HEADER]: "s-1",
    });
  });
});
