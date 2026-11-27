import { describe, expect, it, vi } from "vitest";
import {
  ApolloLink,
  Observable,
  execute,
  gql,
  type DocumentNode,
  type FetchResult,
} from "@apollo/client/core";
import { createConfigCacheLink } from "@/configCacheLink";

const sortOptions = gql`
  query GetSortOptions($entityType: String!) {
    EntityTypeSortOptions(entityType: $entityType) {
      sortOptions {
        options(input: [{ icon: NoIcon, label: "title", value: "title" }]) {
          value
        }
      }
    }
  }
`;

const createServer = (
  respond: () => FetchResult = () => ({ data: { value: "config" } }),
) => {
  const handle = vi.fn(respond);
  const terminal = new ApolloLink(
    () =>
      new Observable<FetchResult>((observer) => {
        setTimeout(() => {
          observer.next(handle());
          observer.complete();
        });
      }),
  );
  return { handle, terminal };
};

const run = (
  link: ApolloLink,
  query: DocumentNode,
  variables: Record<string, unknown> = { entityType: "production" },
  headers: Record<string, string> = { "X-Tenant-ID": "tenant-1" },
): Promise<FetchResult> =>
  new Promise((resolve, reject) => {
    const withHeaders = new ApolloLink((operation, forward) => {
      operation.setContext({ headers });
      return forward(operation);
    });
    execute(ApolloLink.from([withHeaders, link]), {
      query,
      variables,
    }).subscribe({ next: resolve, error: reject });
  });

const setup = (respond?: () => FetchResult) => {
  const server = createServer(respond);
  const link = ApolloLink.from([createConfigCacheLink(), server.terminal]);
  return { ...server, link };
};

describe("createConfigCacheLink", () => {
  it("answers a repeated config query from memory", async () => {
    const { handle, link } = setup();
    await run(link, sortOptions);
    const second = await run(link, sortOptions);
    expect(handle).toHaveBeenCalledTimes(1);
    expect(second.data).toEqual({ value: "config" });
  });

  it("sends one request for identical config queries in flight", async () => {
    const { handle, link } = setup();
    await Promise.all([run(link, sortOptions), run(link, sortOptions)]);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("asks again for other variables", async () => {
    const { handle, link } = setup();
    await run(link, sortOptions, { entityType: "production" });
    await run(link, sortOptions, { entityType: "mediafile" });
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it("keeps tenants apart", async () => {
    const { handle, link } = setup();
    await run(link, sortOptions, undefined, { "X-Tenant-ID": "tenant-1" });
    await run(link, sortOptions, undefined, { "X-Tenant-ID": "tenant-2" });
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it("never caches entity data", async () => {
    const { handle, link } = setup();
    const entities = gql`
      query getEntities {
        Entities {
          count
        }
      }
    `;
    await run(link, entities);
    await run(link, entities);
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it("never caches a query that mixes config with data", async () => {
    const { handle, link } = setup();
    const mixed = gql`
      query mixed {
        PaginationLimitOptions {
          options(input: []) {
            value
          }
        }
        Entities {
          count
        }
      }
    `;
    await run(link, mixed);
    await run(link, mixed);
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it("never caches config the server trims by permission", async () => {
    const { handle, link } = setup(() => ({
      data: {
        BulkOperations: {
          bulkOperationOptions: { options: [{ value: "edit" }] },
        },
      },
    }));
    const permitted = gql`
      query GetBulkOperations($entityType: String!) {
        BulkOperations(entityType: $entityType) {
          bulkOperationOptions {
            options(input: [{ label: "edit", value: "edit", can: ["x"] }]) {
              value
            }
          }
        }
      }
    `;
    await run(link, permitted);
    await run(link, permitted);
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it.each(["permitted", "readOnly"])(
    "never caches config with a %s permission check",
    async (field) => {
      const { handle, link } = setup(() => ({
        data: { EntityTypeFilters: { panel: { [field]: true } } },
      }));
      const checked = gql`
        query GetFilters($entityType: String!) {
          EntityTypeFilters(type: $entityType) {
            panel {
              ${field}(input: ["update:x"])
            }
          }
        }
      `;
      await run(link, checked);
      await run(link, checked);
      expect(handle).toHaveBeenCalledTimes(2);
    },
  );

  it("caches config with a readOnly flag that is not a permission check", async () => {
    const { handle, link } = setup();
    const flag = gql`
      query GetFilters($entityType: String!) {
        EntityTypeFilters(type: $entityType) {
          panel {
            readOnly
          }
        }
      }
    `;
    await run(link, flag);
    await run(link, flag);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("caches filters with a default taken from the user's session, which stays the same until the next login", async () => {
    const { handle, link } = setup();
    const sessionFilters = gql`
      query GetFilters($entityType: String!) {
        EntityTypeFilters(type: $entityType) {
          advancedFilters {
            owner: advancedFilter(type: selection, key: "owner") {
              defaultValue(value: "session-$email")
            }
          }
        }
      }
    `;
    await run(link, sessionFilters);
    await run(link, sessionFilters);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("asks again after an error response", async () => {
    const { handle, link } = setup(() => ({
      errors: [{ message: "boom" } as never],
    }));
    await run(link, sortOptions);
    await run(link, sortOptions);
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it("asks again after a network failure", async () => {
    let fail = true;
    const handle = vi.fn(() => ({ data: { value: "config" } }));
    const terminal = new ApolloLink(
      () =>
        new Observable<FetchResult>((observer) => {
          if (fail) {
            fail = false;
            observer.error(new Error("offline"));
            return;
          }
          observer.next(handle());
          observer.complete();
        }),
    );
    const link = ApolloLink.from([createConfigCacheLink(), terminal]);
    await expect(run(link, sortOptions)).rejects.toThrow("offline");
    await run(link, sortOptions);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("gives every caller its own copy of the data", async () => {
    const { link } = setup(() => ({ data: { list: ["a"] } }));
    const first = await run(link, sortOptions);
    (first.data!.list as string[]).push("changed");
    const second = await run(link, sortOptions);
    expect(second.data).toEqual({ list: ["a"] });
  });

  describe("a filters query shared by several entity types", () => {
    const shared = gql`
      query getAdvancedFilters($entityType: String!) {
        EntityTypeFilters(type: $entityType) {
          ... on Production {
            ...filtersForProduction
          }
          ... on User {
            panel {
              permitted(input: ["update:user"])
            }
          }
        }
      }
      fragment filtersForProduction on Production {
        advancedFilters {
          type
        }
      }
    `;
    const answering =
      (__typename: string, extra: object = {}) =>
      () => ({
        data: { EntityTypeFilters: { __typename, ...extra } },
      });

    it("caches it for a type whose part has no permission check", async () => {
      const { handle, link } = setup(answering("Production"));
      await run(link, shared);
      await run(link, shared);
      expect(handle).toHaveBeenCalledTimes(1);
    });

    const withFilterForAdmins = gql`
      query getAdvancedFilters($entityType: String!) {
        EntityTypeFilters(type: $entityType) {
          ... on Production {
            advancedFilters {
              title: advancedFilter(type: text, key: "title") {
                key
              }
            }
          }
          ... on User {
            advancedFilters {
              roles: advancedFilter(
                type: selection
                key: "roles"
                can: ["read:roles"]
              ) {
                key
              }
            }
          }
        }
      }
    `;

    it("caches it for a type without the filter the server shows by permission", async () => {
      const { handle, link } = setup(
        answering("Production", {
          advancedFilters: { title: { key: "title" } },
        }),
      );
      await run(link, withFilterForAdmins);
      await run(link, withFilterForAdmins);
      expect(handle).toHaveBeenCalledTimes(1);
    });

    it("never caches it for a type with the filter the server shows by permission", async () => {
      const { handle, link } = setup(
        answering("User", { advancedFilters: { roles: { key: "roles" } } }),
      );
      await run(link, withFilterForAdmins, { entityType: "user" });
      await run(link, withFilterForAdmins, { entityType: "user" });
      expect(handle).toHaveBeenCalledTimes(2);
    });

    it("never caches it for a type whose part has a permission check", async () => {
      const { handle, link } = setup(
        answering("User", { panel: { permitted: true } }),
      );
      await run(link, shared, { entityType: "user" });
      await run(link, shared, { entityType: "user" });
      expect(handle).toHaveBeenCalledTimes(2);
    });
  });

  it("caches config whose labels contain the word can", async () => {
    const { handle, link } = setup();
    const labelled = gql`
      query GetFilters($entityType: String!) {
        EntityTypeFilters(type: $entityType) {
          advancedFilters {
            title: advancedFilter(
              type: text
              key: "title"
              label: "you can search"
            ) {
              key
            }
          }
        }
      }
    `;
    await run(link, labelled);
    await run(link, labelled);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  describe("across page loads", () => {
    const memoryStorage = () => {
      const items = new Map<string, string>();
      return {
        getItem: (key: string) => items.get(key) ?? null,
        setItem: (key: string, value: string) => void items.set(key, value),
        removeItem: (key: string) => void items.delete(key),
        key: (index: number) => [...items.keys()][index] ?? null,
        get length() {
          return items.size;
        },
      };
    };
    const linkFor = (
      storage: ReturnType<typeof memoryStorage>,
      scope: string,
      terminal: ApolloLink,
    ) => ApolloLink.from([createConfigCacheLink({ storage, scope }), terminal]);

    it("answers config from the previous page load of the same version and user", async () => {
      const storage = memoryStorage();
      const { handle, terminal } = createServer();
      await run(linkFor(storage, "v1|anna", terminal), sortOptions);
      const second = await run(
        linkFor(storage, "v1|anna", terminal),
        sortOptions,
      );
      expect(handle).toHaveBeenCalledTimes(1);
      expect(second.data).toEqual({ value: "config" });
    });

    it("asks again after a deploy", async () => {
      const storage = memoryStorage();
      const { handle, terminal } = createServer();
      await run(linkFor(storage, "v1|anna", terminal), sortOptions);
      await run(linkFor(storage, "v2|anna", terminal), sortOptions);
      expect(handle).toHaveBeenCalledTimes(2);
    });

    it("asks again for another user", async () => {
      const storage = memoryStorage();
      const { handle, terminal } = createServer();
      await run(linkFor(storage, "v1|anna", terminal), sortOptions);
      await run(linkFor(storage, "v1|ben", terminal), sortOptions);
      expect(handle).toHaveBeenCalledTimes(2);
    });

    it("keeps working when the browser refuses storage", async () => {
      const storage = memoryStorage();
      storage.setItem = () => {
        throw new Error("quota");
      };
      const { handle, terminal } = createServer();
      const link = linkFor(storage, "v1|anna", terminal);
      await run(link, sortOptions);
      await run(link, sortOptions);
      expect(handle).toHaveBeenCalledTimes(1);
    });
  });
});
