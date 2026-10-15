import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApolloLink,
  Observable,
  execute,
  gql,
  type FetchResult,
} from "@apollo/client/core";
import {
  appliedFilterPaths,
  createUsageLink,
  identifyUser,
  initUsageAnalytics,
  libraryOf,
  pseudonymOf,
  resetUsageAnalytics,
  trackUsage,
  type UsageTracker,
} from "@/analytics/usageAnalytics";

const settings = {
  clientId: "1c8c5159",
  apiUrl: "http://openpanel.localhost:8000/api",
};

const fakeTracker = (): UsageTracker => ({
  track: vi.fn(),
  identify: vi.fn(),
  setGroup: vi.fn(),
  upsertGroup: vi.fn(),
});

afterEach(() => {
  resetUsageAnalytics();
  vi.restoreAllMocks();
});

describe("initUsageAnalytics", () => {
  it("does not load the OpenPanel SDK when the config has no usageAnalytics", async () => {
    const load = vi.fn();
    expect(await initUsageAnalytics({}, "s-1", load)).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it("starts the SDK with the configured settings and the session id", async () => {
    const tracker = fakeTracker();
    const startUsageAnalytics = vi.fn().mockReturnValue(tracker);
    const load = vi.fn().mockResolvedValue({ startUsageAnalytics });
    expect(
      await initUsageAnalytics({ usageAnalytics: settings }, "s-1", load),
    ).toBe(true);
    expect(startUsageAnalytics).toHaveBeenCalledWith({
      ...settings,
      sessionId: "s-1",
    });
  });

  it("keeps the app running when the SDK cannot be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const load = vi.fn().mockRejectedValue(new Error("chunk failed"));
    expect(
      await initUsageAnalytics({ usageAnalytics: settings }, "s-1", load),
    ).toBe(false);
    expect(warn).toHaveBeenCalled();
  });
});

describe("trackUsage", () => {
  it("does nothing while usage analytics is off", () => {
    expect(() => trackUsage("search", { query_length: 4 })).not.toThrow();
  });

  it("passes events to the tracker once started", async () => {
    const tracker = fakeTracker();
    await initUsageAnalytics({ usageAnalytics: settings }, "s-1", async () => ({
      startUsageAnalytics: () => tracker,
    }));
    trackUsage("search", { query_length: 4 });
    expect(tracker.track).toHaveBeenCalledWith("search", { query_length: 4 });
  });
});

describe("the user, pseudonymous, in a library", () => {
  it("names the library by the e-mail domain", () => {
    expect(libraryOf("Ann.Peeters@Brugge.be")).toBe("brugge.be");
    expect(libraryOf("no-at-sign")).toBeUndefined();
    expect(libraryOf(undefined)).toBeUndefined();
  });

  it("gives a stable pseudonym, not the e-mail or id", async () => {
    const pseudonym = await pseudonymOf("ann.peeters@brugge.be");
    expect(pseudonym).toMatch(/^[0-9a-f]{16}$/);
    expect(await pseudonymOf("ann.peeters@brugge.be")).toBe(pseudonym);
    expect(await pseudonymOf("someone@else.be")).not.toBe(pseudonym);
  });

  it("identifies the pseudonym and puts the user in the library's group", async () => {
    const tracker = fakeTracker();
    await initUsageAnalytics({ usageAnalytics: settings }, "s-1", async () => ({
      startUsageAnalytics: () => tracker,
    }));
    const pseudonym = await identifyUser({
      sub: "kc-123",
      email: "ann.peeters@brugge.be",
    });
    expect(pseudonym).toBe(await pseudonymOf("kc-123"));
    expect(tracker.identify).toHaveBeenCalledWith({
      profileId: pseudonym,
      properties: { library: "brugge.be" },
    });
    expect(tracker.upsertGroup).toHaveBeenCalledWith({
      id: "brugge.be",
      type: "library",
      name: "brugge.be",
    });
    expect(tracker.setGroup).toHaveBeenCalledWith("brugge.be");
    expect(JSON.stringify(vi.mocked(tracker.identify).mock.calls)).not.toContain(
      "ann.peeters",
    );
  });

  it("still gives the pseudonym (for Sentry) while usage analytics is off", async () => {
    expect(await identifyUser({ email: "ann@brugge.be" })).toBe(
      await pseudonymOf("ann@brugge.be"),
    );
    expect(await identifyUser(undefined)).toBeUndefined();
  });
});

describe("createUsageLink", () => {
  const respond = (result: FetchResult) =>
    new ApolloLink(() => Observable.of(result));
  const fail = () =>
    new ApolloLink(
      () =>
        new Observable((observer) => observer.error(new Error("network down"))),
    );
  const run = (link: ApolloLink, query: any, variables = {}) =>
    new Promise<void>((resolve) =>
      execute(link, { query, variables }).subscribe({
        complete: resolve,
        error: () => resolve(),
      }),
    );

  const mutation = gql`
    mutation mutateEntityValues($id: String!, $type: String!) {
      mutateEntityValues(id: $id, type: $type)
    }
  `;
  const query = gql`
    query getEntities($type: String!) {
      Entities(type: $type)
    }
  `;

  it("tracks a mutation by its operation name, entity type and outcome", async () => {
    const track = vi.fn();
    await run(
      createUsageLink(track).concat(respond({ data: { ok: true } })),
      mutation,
      { id: "1", type: "manifestation_word" },
    );
    expect(track).toHaveBeenCalledWith("mutateEntityValues", {
      kind: "mutation",
      outcome: "ok",
      entity_type: "manifestation_word",
    });
  });

  it("reads the entity type from an entity input too", async () => {
    const track = vi.fn();
    await run(
      createUsageLink(track).concat(respond({ data: { ok: true } })),
      mutation,
      { entity: { type: "work_word" } },
    );
    expect(track.mock.calls[0][1].entity_type).toBe("work_word");
  });

  it("marks a mutation with GraphQL errors or a network error as an error", async () => {
    const track = vi.fn();
    await run(
      createUsageLink(track).concat(
        respond({ errors: [{ message: "nope" } as any] }),
      ),
      mutation,
    );
    await run(createUsageLink(track).concat(fail()), mutation);
    expect(track.mock.calls.map(([, properties]) => properties.outcome)).toEqual(
      ["error", "error"],
    );
  });

  it("leaves queries alone", async () => {
    const track = vi.fn();
    await run(
      createUsageLink(track).concat(respond({ data: { Entities: [] } })),
      query,
      { type: "person" },
    );
    expect(track).not.toHaveBeenCalled();
  });
});

describe("appliedFilterPaths", () => {
  it("names the filters by their logical path, without the type filter or a client prefix", () => {
    expect(
      appliedFilterPaths([
        { type: "type", key: "type", value: "manifestation_word" },
        { type: "selection", key: "vlacc:1|properties.material_type.value", value: ["BOEK"] },
        { type: "date", key: ["vlacc:1|audit.created.at"], value: { min: "2026-01-01" } },
        { type: "text", key: "vlacc:1|properties.title.value", value: "" },
      ] as any),
    ).toEqual(["properties.material_type.value", "audit.created.at"]);
  });
});
