import {
  ApolloLink,
  Observable,
  type ApolloClient,
  type DocumentNode,
} from "@apollo/client/core";

let inFlight = 0;
let lastActivity = 0;

export const warmUpLink = new ApolloLink((operation, forward) => {
  if (operation.getContext().warmUp) return Observable.of();
  inFlight += 1;
  lastActivity = Date.now();
  return new Observable((observer) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      inFlight -= 1;
      lastActivity = Date.now();
    };
    const subscription = forward(operation).subscribe({
      next: (value) => observer.next(value),
      error: (error) => {
        finish();
        observer.error(error);
      },
      complete: () => {
        finish();
        observer.complete();
      },
    });
    return () => {
      finish();
      subscription.unsubscribe();
    };
  });
});

const whenQuiet = (quietMs: number) =>
  new Promise<void>((resolve) => {
    const check = () =>
      inFlight === 0 && Date.now() - lastActivity >= quietMs
        ? resolve()
        : setTimeout(check, 100);
    setTimeout(check, quietMs);
  });

const whenIdle = () =>
  new Promise<void>((resolve) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(() => resolve(), { timeout: 2000 })
      : setTimeout(resolve, 200),
  );

export const warmUpQueries = async (
  client: ApolloClient<unknown>,
  documents: DocumentNode[],
  quietMs = 500,
) => {
  for (const query of documents) {
    await whenQuiet(quietMs);
    await whenIdle();
    await client
      .query({ query, fetchPolicy: "no-cache", context: { warmUp: true } })
      .catch(() => undefined);
  }
};
