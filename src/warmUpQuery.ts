import {
  ApolloLink,
  Observable,
  type ApolloClient,
  type DocumentNode,
} from "@apollo/client/core";

export const warmUpLink = new ApolloLink((operation, forward) =>
  operation.getContext().warmUp ? Observable.of() : forward(operation),
);

const whenIdle = () =>
  new Promise<void>((resolve) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(() => resolve(), { timeout: 2000 })
      : setTimeout(resolve, 200),
  );

export const warmUpQueries = async (
  client: ApolloClient<unknown>,
  documents: DocumentNode[],
) => {
  for (const query of documents) {
    await whenIdle();
    await client
      .query({ query, fetchPolicy: "no-cache", context: { warmUp: true } })
      .catch(() => undefined);
  }
};
