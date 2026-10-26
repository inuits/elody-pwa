import { ApolloLink } from "@apollo/client/core";

export const SESSION_HEADER = "x-elody-session-id";

/**
 * Sends the tab's session id with every GraphQL request: the GraphQL server
 * passes it on (W3C baggage) to every service the request reaches, so all of a
 * session's spans, not only the browser's, can be found by it.
 */
export const createSessionLink = (sessionId: string): ApolloLink =>
  new ApolloLink((operation, forward) => {
    operation.setContext(
      ({ headers = {} }: { headers?: Record<string, string> }) => ({
        headers: { ...headers, [SESSION_HEADER]: sessionId },
      }),
    );
    return forward(operation);
  });
