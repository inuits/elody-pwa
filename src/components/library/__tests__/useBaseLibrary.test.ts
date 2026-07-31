import { describe, it, expect, vi } from "vitest";

// useBaseLibrary calls these at setup time; mock them so the composable can be
// instantiated outside of a component.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ locale: { value: "nl" } }),
}));
vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getStateForRoute: vi.fn(),
    updateStateForRoute: vi.fn(),
  }),
}));
// Avoid the real dynamic import of generated-types/queries.ts — it's slow and
// irrelevant since apolloClient.query is mocked directly in these tests.
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { useBaseLibrary } from "../useBaseLibrary";

const mockApolloClient = {} as any;

// Force a specific function.name to simulate what esbuild minification does:
// distinct functions can end up sharing the same short mangled name.
const withName = (name: string, fn: (...args: any[]) => Promise<void>) => {
  Object.defineProperty(fn, "name", { value: name });
  return fn as (entityType: any) => Promise<void>;
};

describe("useBaseLibrary – enqueuePromise dedupe", () => {
  it("enqueues two DISTINCT promises even when they share the same function.name", async () => {
    const { enqueuePromise, fetchAllPromises } = useBaseLibrary(mockApolloClient);

    let ranA = 0;
    let ranB = 0;
    const promiseA = withName("N", async () => {
      ranA++;
    });
    const promiseB = withName("N", async () => {
      ranB++;
    });

    enqueuePromise(promiseA);
    enqueuePromise(promiseB);
    await fetchAllPromises();

    // Before the fix promiseB was skipped as a "duplicate" because it shared the
    // minified name "N" with promiseA, so the second fetch (e.g. advancedFilters)
    // never ran.
    expect(ranA).toBe(1);
    expect(ranB).toBe(1);
  });

  it("does NOT enqueue the exact same promise reference twice", async () => {
    const { enqueuePromise, fetchAllPromises } = useBaseLibrary(mockApolloClient);

    let ran = 0;
    const promise = withName("X", async () => {
      ran++;
    });

    enqueuePromise(promise);
    enqueuePromise(promise);
    await fetchAllPromises();

    expect(ran).toBe(1);
  });
});

describe("useBaseLibrary – getEntities count reconciliation", () => {
  const mockRoute = { name: "TestRoute", meta: {} } as any;

  const mockQueryResult = (entities: any[], count: number) => ({
    data: {
      Entities: { results: entities, count, facets: [] },
    },
  });

  it("reconciles totalEntityCount with the backend response even when the returned results are deep-equal to the current entities", async () => {
    const sameEntity = { id: "a" };
    const apolloClient = {
      query: vi.fn().mockResolvedValue(mockQueryResult([sameEntity], 30)),
    } as any;
    const { entities, totalEntityCount, getEntities } =
      useBaseLibrary(apolloClient);

    await getEntities(mockRoute);
    expect(totalEntityCount.value).toBe(30);

    // Simulate a stale/inflated count (e.g. from a mis-fired optimistic
    // adjustment) while entities itself already matches the backend response.
    totalEntityCount.value = 40;
    entities.value = [sameEntity];

    await getEntities(mockRoute);

    expect(totalEntityCount.value).toBe(30);
  });

  it("exposes a fetchSequence counter that increments each time a response is applied", async () => {
    const apolloClient = {
      query: vi.fn().mockResolvedValue(mockQueryResult([{ id: "a" }], 30)),
    } as any;
    const { getEntities, fetchSequence } = useBaseLibrary(apolloClient);

    expect(fetchSequence.value).toBe(0);
    await getEntities(mockRoute);
    expect(fetchSequence.value).toBe(1);
    await getEntities(mockRoute);
    expect(fetchSequence.value).toBe(2);
  });
});
