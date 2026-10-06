import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApolloLink, Observable, execute, gql } from "@apollo/client/core";

const handleGraphqlError = vi.fn();
vi.mock("@/composables/useErrorCodes", () => ({
  useErrorCodes: () => ({ handleGraphqlError }),
}));

import { graphqlErrorInterceptor } from "@/helpers";

const runWithStatus = (status: number, context: object = {}) =>
  new Promise<void>((resolve) => {
    const failingLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({
            errors: [
              { message: "error", extensions: { statusCode: status } },
            ] as any,
          });
          observer.complete();
        }),
    );
    execute(graphqlErrorInterceptor.concat(failingLink), {
      query: gql`
        query Test {
          test
        }
      `,
      context,
    }).subscribe({ complete: resolve, error: () => resolve() });
  });

describe("graphqlErrorInterceptor", () => {
  beforeEach(() => handleGraphqlError.mockClear());

  it("leaves a status the operation handles itself to the operation", async () => {
    await runWithStatus(403, { locallyHandledStatusCodes: [403] });
    expect(handleGraphqlError).not.toHaveBeenCalled();
  });

  it("still handles other statuses globally for that operation", async () => {
    await runWithStatus(404, { locallyHandledStatusCodes: [403] });
    expect(handleGraphqlError).toHaveBeenCalledOnce();
  });
});
