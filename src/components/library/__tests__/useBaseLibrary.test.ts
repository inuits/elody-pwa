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

describe("useBaseLibrary – exact count on demand", () => {
  const mockRoute = { name: "TestRoute", meta: {} } as any;

  const listingResult = (results: any[], count: number) => ({
    data: { Entities: { results, count, facets: [] } },
  });
  const exactCountResult = (count: number) => ({
    data: { Entities: { count } },
  });

  it("revealExactCount fetches the exact total without disturbing listing state", async () => {
    const apolloClient = {
      query: vi
        .fn()
        .mockResolvedValueOnce(listingResult([{ id: "a" }], 1001)) // capped listing
        .mockResolvedValueOnce(exactCountResult(30000)), // reveal
    } as any;
    const {
      getEntities,
      revealExactCount,
      exactTotalCount,
      totalEntityCount,
      entities,
      fetchSequence,
    } = useBaseLibrary(apolloClient);

    await getEntities(mockRoute);
    expect(totalEntityCount.value).toBe(1001);
    expect(exactTotalCount.value).toBeNull();
    const seqAfterFetch = fetchSequence.value;
    const entitiesAfterFetch = entities.value;

    await revealExactCount();

    expect(exactTotalCount.value).toBe(30000);
    // The listing state must be untouched: the exact count is display-only and
    // never feeds pagination or the optimistic-count path.
    expect(totalEntityCount.value).toBe(1001);
    expect(fetchSequence.value).toBe(seqAfterFetch);
    expect(entities.value).toBe(entitiesAfterFetch);
  });

  it("passes exactCount: true to the count query", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(listingResult([{ id: "a" }], 1001))
      .mockResolvedValueOnce(exactCountResult(30000));
    const apolloClient = { query } as any;
    const { getEntities, revealExactCount } = useBaseLibrary(apolloClient);

    await getEntities(mockRoute);
    await revealExactCount();

    expect(query.mock.calls[1][0].variables.exactCount).toBe(true);
  });

  it("resets exactTotalCount on the next normal fetch", async () => {
    const apolloClient = {
      query: vi
        .fn()
        .mockResolvedValueOnce(listingResult([{ id: "a" }], 1001))
        .mockResolvedValueOnce(exactCountResult(30000))
        .mockResolvedValueOnce(listingResult([{ id: "a" }], 1001)),
    } as any;
    const { getEntities, revealExactCount, exactTotalCount } =
      useBaseLibrary(apolloClient);

    await getEntities(mockRoute);
    await revealExactCount();
    expect(exactTotalCount.value).toBe(30000);

    await getEntities(mockRoute);
    expect(exactTotalCount.value).toBeNull();
  });

  it("discards a reveal response that resolves after the listing has already moved on", async () => {
    let resolveReveal: (value: unknown) => void;
    const revealPromise = new Promise((resolve) => {
      resolveReveal = resolve;
    });
    const apolloClient = {
      query: vi
        .fn()
        .mockResolvedValueOnce(listingResult([{ id: "a" }], 1001)) // initial capped listing
        .mockReturnValueOnce(revealPromise) // reveal, left pending
        .mockResolvedValueOnce(listingResult([{ id: "b" }], 1001)), // listing changes mid-flight
    } as any;
    const { getEntities, revealExactCount, exactTotalCount, exactCountLoading } =
      useBaseLibrary(apolloClient);

    await getEntities(mockRoute);
    const reveal = revealExactCount();
    expect(exactCountLoading.value).toBe(true);

    // Filters change while the reveal request is still in flight.
    await getEntities(mockRoute);
    expect(exactTotalCount.value).toBeNull();
    expect(exactCountLoading.value).toBe(false);

    // The stale reveal response now arrives.
    resolveReveal!(exactCountResult(30000));
    await reveal;

    // It must not resurrect an exact total for a listing that's no longer current.
    expect(exactTotalCount.value).toBeNull();
    expect(exactCountLoading.value).toBe(false);
  });
});
