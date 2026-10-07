import { describe, it, expect, vi } from "vitest";
import {
  AdvancedFilterTypes,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  type GroupByConfig,
} from "@/generated-types/queries";
import {
  buildTableItems,
  getGroupValue,
  useGroupedEntities,
  type EntityGroup,
  type FetchEntities,
} from "../useGroupedEntities";

type Comment = { id: string; category: string | null; activity: number };

const config: GroupByConfig = {
  key: "intialValues.category",
  filterKey: ["vlacc:1|properties.category.value"],
  distinctBy: "properties.category.value",
  groupOrderBy: "properties.last_activity_at.value",
  pageSize: 2,
  groupsPageSize: 2,
  emptyLabel: "comments.no-category",
};

const typeFilter: AdvancedFilterInput = {
  type: AdvancedFilterTypes.Selection,
  key: "type",
  value: ["comment"],
  match_exact: true,
};

const baseVariables = (): GetEntitiesQueryVariables =>
  ({
    type: "comment",
    limit: 20,
    skip: 3,
    searchValue: {
      value: "",
      key: "title",
      order_by: "properties.status.value",
      isAsc: true,
    },
    advancedFilterInputs: [typeFilter],
  }) as unknown as GetEntitiesQueryVariables;

const toEntity = (comment: Comment): Entity =>
  ({
    id: comment.id,
    intialValues: {
      category:
        comment.category === null
          ? null
          : { label: comment.category, formatter: "pill|auto" },
    },
  }) as unknown as Entity;

const paginate = <T>(items: T[], variables: GetEntitiesQueryVariables) => {
  const limit = variables.limit as number;
  const offset = ((variables.skip as number) - 1) * limit;
  return items.slice(offset, offset + limit);
};

const createBackend = (comments: Comment[]) => {
  const fetchEntities = vi.fn<FetchEntities>(async (variables) => {
    const filters = variables.advancedFilterInputs as AdvancedFilterInput[];
    const isGroupsRequest = filters.some((f) => f.distinct_by);
    if (isGroupsRequest) {
      const newestPerCategory = new Map<string | null, Comment>();
      for (const comment of [...comments].sort(
        (a, b) => b.activity - a.activity,
      ))
        if (!newestPerCategory.has(comment.category))
          newestPerCategory.set(comment.category, comment);
      const groups = [...newestPerCategory.values()];
      return {
        results: paginate(groups, variables).map(toEntity),
        count: groups.length,
      };
    }
    const groupFilter = filters[filters.length - 1];
    const inGroup = comments.filter((comment) =>
      groupFilter.value === ""
        ? comment.category === null
        : (groupFilter.value as string[]).includes(comment.category as string),
    );
    return {
      results: paginate(inGroup, variables).map(toEntity),
      count: inGroup.length,
    };
  });
  return fetchEntities;
};

const comments: Comment[] = [
  { id: "c1", category: "Non-fictie", activity: 10 },
  { id: "c2", category: "Formele catalografie", activity: 30 },
  { id: "c3", category: "Non-fictie", activity: 20 },
  { id: "c4", category: "Non-fictie", activity: 5 },
  { id: "c5", category: null, activity: 1 },
];

const setup = (data: Comment[] = comments) => {
  const fetchEntities = createBackend(data);
  const grouped = useGroupedEntities({
    fetchEntities,
    getBaseVariables: baseVariables,
  });
  return { fetchEntities, grouped };
};

describe("useGroupedEntities", () => {
  it("requests the groups as distinct values ordered by most recent activity", async () => {
    const { fetchEntities, grouped } = setup();

    await grouped.load(config);

    const groupsRequest = fetchEntities.mock.calls[0][0];
    expect(groupsRequest.limit).toBe(2);
    expect(groupsRequest.skip).toBe(1);
    expect(groupsRequest.searchValue).toMatchObject({
      order_by: "properties.last_activity_at.value",
      isAsc: false,
    });
    expect(groupsRequest.advancedFilterInputs).toEqual([
      typeFilter,
      {
        type: AdvancedFilterTypes.Type,
        value: "comment",
        distinct_by: "properties.category.value",
      },
    ]);
    expect(grouped.groups.value.map((group) => group.label)).toEqual([
      "Formele catalografie",
      "Non-fictie",
    ]);
  });

  it("requests each group with an exact filter and keeps the chosen sort", async () => {
    const { fetchEntities, grouped } = setup();

    await grouped.load(config);

    const groupRequest = fetchEntities.mock.calls[2][0];
    expect(groupRequest.limit).toBe(2);
    expect(groupRequest.skip).toBe(1);
    expect(groupRequest.searchValue).toMatchObject({
      order_by: "properties.status.value",
      isAsc: true,
    });
    expect(groupRequest.advancedFilterInputs).toEqual([
      typeFilter,
      {
        type: AdvancedFilterTypes.Selection,
        key: ["vlacc:1|properties.category.value"],
        value: ["Non-fictie"],
        match_exact: true,
      },
    ]);
    expect(grouped.groups.value[1].entities.map((e) => e.id)).toEqual([
      "c1",
      "c3",
    ]);
    expect(grouped.groups.value[1].count).toBe(3);
  });

  it("loads the next page of one group on demand", async () => {
    const { grouped } = setup();
    await grouped.load(config);
    const nonFiction = grouped.groups.value[1];
    expect(nonFiction.hasMore).toBe(true);

    await grouped.loadMoreInGroup(nonFiction.id);

    const updated = grouped.groups.value[1];
    expect(updated.entities.map((e) => e.id)).toEqual(["c1", "c3", "c4"]);
    expect(updated.hasMore).toBe(false);
  });

  it("loads the next groups at the bottom and labels the empty group", async () => {
    const { fetchEntities, grouped } = setup();
    await grouped.load(config);
    expect(grouped.hasMoreGroups.value).toBe(true);

    await grouped.loadMoreGroups();

    expect(grouped.hasMoreGroups.value).toBe(false);
    const emptyGroup = grouped.groups.value[2];
    expect(emptyGroup.label).toBe("comments.no-category");
    expect(emptyGroup.entities.map((e) => e.id)).toEqual(["c5"]);
    const emptyGroupRequest = fetchEntities.mock.calls.at(-1)![0];
    expect(emptyGroupRequest.advancedFilterInputs.at(-1)).toEqual({
      type: AdvancedFilterTypes.Text,
      key: ["vlacc:1|properties.category.value"],
      value: "",
    });
  });

  it("exposes every loaded entity once", async () => {
    const { grouped } = setup();
    await grouped.load(config);

    expect(grouped.entities.value.map((e) => e.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("ignores responses of a load that was superseded", async () => {
    const { grouped } = setup();

    const first = grouped.load(config);
    const second = grouped.load({ ...config, groupsPageSize: 1 });
    await Promise.all([first, second]);

    expect(grouped.groups.value.map((group) => group.label)).toEqual([
      "Formele catalografie",
    ]);
  });

  it("shows the groups again when the same groups are reloaded", async () => {
    const { grouped } = setup();
    await grouped.load(config);

    await grouped.load(config);

    expect(grouped.groups.value.map((group) => group.label)).toEqual([
      "Formele catalografie",
      "Non-fictie",
    ]);
    expect(grouped.entities.value.map((e) => e.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("replaces a user filter on the grouped key by the group filter", async () => {
    const categoryFilter: AdvancedFilterInput = {
      type: AdvancedFilterTypes.Selection,
      key: ["vlacc:1|properties.category.value"],
      value: ["Non-fictie", "Formele catalografie"],
      match_exact: true,
    };
    const fetchEntities = createBackend(comments);
    const grouped = useGroupedEntities({
      fetchEntities,
      getBaseVariables: () => ({
        ...baseVariables(),
        advancedFilterInputs: [typeFilter, categoryFilter],
      }),
    });

    await grouped.load(config);

    const groupsRequest = fetchEntities.mock.calls[0][0];
    expect(groupsRequest.advancedFilterInputs).toContainEqual(categoryFilter);
    const groupRequest = fetchEntities.mock.calls[1][0];
    expect(groupRequest.advancedFilterInputs).toEqual([
      typeFilter,
      {
        type: AdvancedFilterTypes.Selection,
        key: ["vlacc:1|properties.category.value"],
        value: ["Formele catalografie"],
        match_exact: true,
      },
    ]);
  });

  it("matches the grouped key whether it is written as a string or a list", async () => {
    const categoryFilter: AdvancedFilterInput = {
      type: AdvancedFilterTypes.Text,
      key: "vlacc:1|properties.category.value",
      value: "Non",
    };
    const fetchEntities = createBackend(comments);
    const grouped = useGroupedEntities({
      fetchEntities,
      getBaseVariables: () => ({
        ...baseVariables(),
        advancedFilterInputs: [typeFilter, categoryFilter],
      }),
    });

    await grouped.load(config);

    const groupRequest = fetchEntities.mock.calls[1][0];
    expect(groupRequest.advancedFilterInputs).not.toContainEqual(categoryFilter);
  });

  it("resolves group values to labels for entity reference groups", async () => {
    const fetchEntities = createBackend(comments);
    const resolveLabels = vi.fn(async (ids: string[]) =>
      ids.map((id) => ({ key: id, value: `Label of ${id}` })),
    );
    const grouped = useGroupedEntities({
      fetchEntities,
      getBaseVariables: baseVariables,
      resolveLabels,
    });

    await grouped.load({
      ...config,
      labelEntityTypes: ["group"],
      labelMetadataKey: "name",
    });

    expect(resolveLabels).toHaveBeenCalledWith(
      ["Formele catalografie", "Non-fictie"],
      ["group"],
      "name",
    );
    expect(grouped.groups.value.map((group) => group.label)).toEqual([
      "Label of Formele catalografie",
      "Label of Non-fictie",
    ]);
  });

  it("does not resolve labels without label entity types", async () => {
    const resolveLabels = vi.fn();
    const grouped = useGroupedEntities({
      fetchEntities: createBackend(comments),
      getBaseVariables: baseVariables,
      resolveLabels,
    });

    await grouped.load(config);

    expect(resolveLabels).not.toHaveBeenCalled();
  });

  it("clears the groups on reset", async () => {
    const { grouped } = setup();
    await grouped.load(config);

    grouped.reset();

    expect(grouped.groups.value).toEqual([]);
    expect(grouped.entities.value).toEqual([]);
    expect(grouped.hasMoreGroups.value).toBe(false);
  });
});

describe("buildTableItems", () => {
  const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const group = (id: string, entityIds: string[]): EntityGroup => ({
    id,
    value: id,
    label: id,
    entities: entityIds.map((entityId) => ({ id: entityId }) as Entity),
    count: entityIds.length,
    page: 1,
    loading: false,
    hasMore: false,
  });

  it("lists every row without group markers when there are no groups", () => {
    expect(buildTableItems(rows, undefined)).toEqual(
      rows.map((row) => ({
        key: row.id,
        row,
        groupStart: undefined,
        groupEnd: undefined,
      })),
    );
  });

  it("orders the rows per group and marks the first and last row of a group", () => {
    const x = group("x", ["c", "a"]);
    const y = group("y", ["a"]);

    const items = buildTableItems(rows, [x, y]);

    expect(
      items.map((item) => [
        item.key,
        item.row?.id,
        item.groupStart?.id,
        item.groupEnd?.id,
      ]),
    ).toEqual([
      ["x_c", "c", "x", undefined],
      ["x_a", "a", undefined, "x"],
      ["y_a", "a", "y", "y"],
    ]);
  });

  it("keeps a group without loaded rows as a single header item", () => {
    const empty = group("x", []);

    expect(buildTableItems(rows, [empty])).toEqual([
      { key: "x_empty", row: undefined, groupStart: empty, groupEnd: empty },
    ]);
  });
});

describe("getGroupValue", () => {
  const withCategory = (category: unknown) =>
    ({ intialValues: { category } }) as unknown as Entity;

  it("reads plain and formatted values", () => {
    expect(getGroupValue(withCategory("Advies"), "intialValues.category")).toBe(
      "Advies",
    );
    expect(
      getGroupValue(
        withCategory({ label: "Advies", formatter: "pill|auto" }),
        "intialValues.category",
      ),
    ).toBe("Advies");
  });

  it("treats a formatted value without a usable label as empty", () => {
    expect(
      getGroupValue(
        withCategory({ formatter: "pill|auto" }),
        "intialValues.category",
      ),
    ).toBeNull();
    expect(
      getGroupValue(
        withCategory({ label: [], formatter: "pill|auto" }),
        "intialValues.category",
      ),
    ).toBeNull();
    expect(
      getGroupValue(
        withCategory({ label: {}, formatter: "pill|auto" }),
        "intialValues.category",
      ),
    ).toBeNull();
  });
});
