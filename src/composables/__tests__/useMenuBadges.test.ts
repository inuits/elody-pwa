import { beforeEach, describe, expect, it, vi } from "vitest";
import { MenuBadgeSource, type MenuItem } from "@/generated-types/queries";
import { useMenuBadges } from "@/composables/useMenuBadges";
import { useSeenItems } from "@/composables/useSeenItems";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/main", () => ({
  apolloClient: { query },
  router: {
    getRoutes: () => [
      {
        meta: {
          entityPageConfig: {
            comment: {
              trackSeen: true,
              seenActivityKey: "last_activity_at",
              seenDisplay: "highlightNew",
              seenTtlDays: 30,
            },
          },
        },
      },
    ],
  },
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: async (name: string) => name }),
}));

const recently = () => new Date(Date.now() - 60_000).toISOString();

const respondWith = (responses: Record<string, any>) =>
  query.mockImplementation(async ({ query: documentName }) => ({
    data: responses[documentName],
  }));

const commentsOf = (...ids: string[]) => ({
  Entities: {
    count: ids.length,
    results: ids.map((id) => ({
      id,
      intialValues: { last_activity_at: recently() },
    })),
  },
});

const menuItemWith = (badge: MenuItem["badge"], extra: Partial<MenuItem> = {}) =>
  ({
    label: "item",
    typeLink: { route: { destination: "somewhere" } },
    badge,
    ...extra,
  }) as MenuItem;

describe("useMenuBadges", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("shows the number a count query returns", async () => {
    respondWith({ GetUnreadCount: { Entities: { count: 7, results: [] } } });
    const item = menuItemWith({
      source: MenuBadgeSource.Count,
      query: "GetUnreadCount",
      entityType: "job",
    });
    const { refreshBadges, badgeCountOf } = useMenuBadges();

    await refreshBadges([item]);

    expect(badgeCountOf(item)).toBe(7);
  });

  it("sends the hidden default filters of the filter query", async () => {
    respondWith({
      GetFilters: {
        EntityTypeFilters: {
          advancedFilters: {
            type: {
              type: "selection",
              key: "type",
              defaultValue: ["comment"],
              hidden: true,
            },
          },
        },
      },
      GetFilteredCount: { Entities: { count: 1, results: [] } },
    });
    const item = menuItemWith({
      source: MenuBadgeSource.Count,
      query: "GetFilteredCount",
      filterQuery: "GetFilters",
      entityType: "comment",
    });

    await useMenuBadges().refreshBadges([item]);

    const countCall = query.mock.calls.find(
      ([options]) => options.query === "GetFilteredCount",
    )![0];
    expect(countCall.variables.advancedFilterInputs).toEqual([
      expect.objectContaining({ key: "type", value: ["comment"] }),
    ]);
  });

  it("counts only items that are new according to the seen state", async () => {
    respondWith({ GetMine: commentsOf("CMT-NEW-1", "CMT-NEW-2", "CMT-SEEN") });
    useSeenItems().markAsSeen("CMT-SEEN");
    const item = menuItemWith({
      source: MenuBadgeSource.SeenItems,
      query: "GetMine",
      entityType: "comment",
    });
    const { refreshBadges, badgeCountOf } = useMenuBadges();

    await refreshBadges([item]);
    expect(badgeCountOf(item)).toBe(2);

    useSeenItems().markAsSeen("CMT-NEW-1");
    expect(badgeCountOf(item)).toBe(1);
  });

  it("adds the children to the parent only when enabled", async () => {
    respondWith({
      GetOwn: { Entities: { count: 1, results: [] } },
      GetChildA: commentsOf("CMT-A-1", "CMT-A-2"),
      GetChildB: commentsOf("CMT-B-1"),
    });
    const subMenu = {
      name: "sub",
      a: menuItemWith({
        source: MenuBadgeSource.SeenItems,
        query: "GetChildA",
        entityType: "comment",
      }),
      b: menuItemWith({
        source: MenuBadgeSource.SeenItems,
        query: "GetChildB",
        entityType: "comment",
      }),
      plain: menuItemWith(undefined),
    } as any;
    const ownBadge = {
      source: MenuBadgeSource.Count,
      query: "GetOwn",
      entityType: "comment",
    };
    const summingParent = menuItemWith(ownBadge, {
      subMenu,
      showChildBadgeTotal: true,
    });
    const plainParent = menuItemWith(ownBadge, { subMenu });
    const { refreshBadges, totalBadgeCountOf } = useMenuBadges();

    await refreshBadges([summingParent]);

    expect(totalBadgeCountOf(summingParent)).toBe(4);
    expect(totalBadgeCountOf(plainParent)).toBe(1);
  });

  it("counts an item that is new in several children once in the parent", async () => {
    respondWith({
      GetMineShared: commentsOf("CMT-SHARED", "CMT-ONLY-MINE"),
      GetTaggedShared: commentsOf("CMT-SHARED"),
      GetCountChild: { Entities: { count: 2, results: [] } },
    });
    const childWith = (query: string, source = MenuBadgeSource.SeenItems) =>
      menuItemWith({ source, query, entityType: "comment" });
    const parent = menuItemWith(undefined, {
      showChildBadgeTotal: true,
      subMenu: {
        name: "sub",
        mine: childWith("GetMineShared"),
        tagged: childWith("GetTaggedShared"),
        counted: childWith("GetCountChild", MenuBadgeSource.Count),
      } as any,
    });
    const { refreshBadges, badgeCountOf, totalBadgeCountOf } = useMenuBadges();

    await refreshBadges([parent]);

    expect(badgeCountOf((parent.subMenu as any).tagged)).toBe(1);
    expect(totalBadgeCountOf(parent)).toBe(4);
  });

  it("keeps the other badges when one query fails", async () => {
    query.mockImplementation(async ({ query: documentName }) => {
      if (documentName === "GetBroken") throw new Error("boom");
      return { data: { Entities: { count: 3, results: [] } } };
    });
    const broken = menuItemWith({
      source: MenuBadgeSource.Count,
      query: "GetBroken",
      entityType: "job",
    });
    const working = menuItemWith({
      source: MenuBadgeSource.Count,
      query: "GetWorking",
      entityType: "job",
    });
    const { refreshBadges, badgeCountOf } = useMenuBadges();

    await refreshBadges([broken, working]);

    expect(badgeCountOf(broken)).toBe(0);
    expect(badgeCountOf(working)).toBe(3);
  });
});
