import { computed, shallowRef } from "vue";
import {
  AdvancedFilterTypes,
  Operator,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  type GroupByConfig,
  type GroupByPinnedGroup,
} from "@/generated-types/queries";

export type EntityGroup = {
  id: string;
  value: string | null;
  label: string;
  entities: Entity[];
  count: number;
  page: number;
  loading: boolean;
  hasMore: boolean;
  pinned?: boolean;
  filterKey?: string[];
  translationKey?: string | null;
};

export type FetchEntities = (
  variables: GetEntitiesQueryVariables,
) => Promise<{ results: Entity[]; count: number }>;

export type ResolveLabels = (
  ids: string[],
  types: string[],
  metadataKey: string | undefined,
) => Promise<{ key: string; value: string }[]>;

export type UseGroupedEntitiesOptions = {
  fetchEntities: FetchEntities;
  getBaseVariables: () => GetEntitiesQueryVariables;
  resolveLabels?: ResolveLabels;
};

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_GROUPS_PAGE_SIZE = 5;

export const groupHeaderLabel = (
  group: EntityGroup,
  t: (key: string) => string,
): string => {
  if (group.value === null || group.pinned) return t(group.label);
  if (!group.translationKey) return group.label;
  const key = group.translationKey.replace("$value", group.value);
  const translated = t(key);
  return translated !== key ? translated : group.label;
};

export const getGroupValue = (entity: Entity, path: string): string | null => {
  let value: any = path
    .split(".")
    .reduce((current: any, segment) => current?.[segment], entity);
  while (Array.isArray(value) || (value && typeof value === "object"))
    value = Array.isArray(value) ? value[0] : value.label;
  return typeof value === "string" || typeof value === "number"
    ? String(value) || null
    : null;
};

export type TableItem<Row extends { id: string }> = {
  key: string;
  row: Row | undefined;
  groupStart: EntityGroup | undefined;
  groupEnd: EntityGroup | undefined;
};

export const buildTableItems = <Row extends { id: string }>(
  rows: Row[],
  groups: EntityGroup[] | undefined,
): TableItem<Row>[] => {
  if (!groups)
    return rows.map((row) => ({
      key: row.id,
      row,
      groupStart: undefined,
      groupEnd: undefined,
    }));
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  return groups.reduce<TableItem<Row>[]>((items, group) => {
    if (group.pinned && !group.loading && group.count === 0) return items;
    const groupRows = group.entities
      .map((entity) => rowsById.get(entity.id))
      .filter((row): row is Row => row !== undefined);
    if (groupRows.length === 0)
      return items.concat({
        key: `${group.id}_empty`,
        row: undefined,
        groupStart: group,
        groupEnd: group,
      });
    return items.concat(
      groupRows.map((row, index) => ({
        key: `${group.id}_${row.id}`,
        row,
        groupStart: index === 0 ? group : undefined,
        groupEnd: index === groupRows.length - 1 ? group : undefined,
      })),
    );
  }, []);
};

export const useGroupedEntities = (options: UseGroupedEntitiesOptions) => {
  const groups = shallowRef<EntityGroup[]>([]);
  const groupsCount = shallowRef<number>(0);
  const groupsPage = shallowRef<number>(0);
  const loading = shallowRef<boolean>(false);
  const replacedGroupsCount = shallowRef<number>(0);
  let activeConfig: GroupByConfig | undefined;
  let generation = 0;

  const hasMoreGroups = computed(
    () =>
      groups.value.filter(({ pinned }) => !pinned).length +
        replacedGroupsCount.value <
      groupsCount.value,
  );

  const entities = computed<Entity[]>(() => {
    const seen = new Set<string>();
    return groups.value
      .reduce<Entity[]>((all, group) => all.concat(group.entities), [])
      .filter((entity) => !seen.has(entity.id) && !!seen.add(entity.id));
  });

  const baseFilters = (variables: GetEntitiesQueryVariables) =>
    (variables.advancedFilterInputs ?? []) as AdvancedFilterInput[];

  const normalizedKey = (key: unknown): string =>
    (Array.isArray(key) ? key : [key]).map(String).sort().join("|");

  const baseFiltersWithoutKey = (
    variables: GetEntitiesQueryVariables,
    filterKey: string[],
  ) =>
    baseFilters(variables).filter(
      (filter) =>
        filter.operator === Operator.Or ||
        normalizedKey(filter.key) !== normalizedKey(filterKey),
    );

  const groupFilter = (
    filterKey: string[],
    value: string | null,
  ): AdvancedFilterInput =>
    value === null
      ? { type: AdvancedFilterTypes.Text, key: filterKey, value: "" }
      : {
          type: AdvancedFilterTypes.Selection,
          key: filterKey,
          value: [value],
          match_exact: true,
        };

  const toPinnedGroup = (pinnedGroup: GroupByPinnedGroup): EntityGroup => ({
    id: `pinned:${pinnedGroup.id}`,
    value: pinnedGroup.value,
    label: pinnedGroup.label,
    entities: [],
    count: 0,
    page: 0,
    loading: true,
    hasMore: false,
    pinned: true,
    filterKey: pinnedGroup.filterKey,
  });

  const updateGroup = (id: string, changes: Partial<EntityGroup>) => {
    groups.value = groups.value.map((group) =>
      group.id === id ? { ...group, ...changes } : group,
    );
  };

  const fetchGroupPage = async (
    config: GroupByConfig,
    group: EntityGroup,
    page: number,
    loadGeneration: number,
  ) => {
    const variables = options.getBaseVariables();
    const pageSize = config.pageSize ?? DEFAULT_PAGE_SIZE;
    const filterKey = group.filterKey ?? config.filterKey;
    updateGroup(group.id, { loading: true });
    const { results, count } = await options.fetchEntities({
      ...variables,
      limit: pageSize,
      skip: page,
      advancedFilterInputs: [
        ...baseFiltersWithoutKey(variables, filterKey),
        groupFilter(filterKey, group.value),
      ],
    });
    if (loadGeneration !== generation) return;
    const current = groups.value.find(({ id }) => id === group.id);
    const loaded = [...(page === 1 ? [] : (current?.entities ?? [])), ...results];
    updateGroup(group.id, {
      entities: loaded,
      count,
      page,
      loading: false,
      hasMore: loaded.length < count,
    });
  };

  const withResolvedLabels = async (
    config: GroupByConfig,
    newGroups: EntityGroup[],
  ): Promise<EntityGroup[]> => {
    const ids = newGroups
      .map(({ value }) => value)
      .filter((value): value is string => value !== null);
    if (!config.labelEntityTypes?.length || !options.resolveLabels || !ids.length)
      return newGroups;
    const labels = await options.resolveLabels(
      ids,
      config.labelEntityTypes,
      config.labelMetadataKey ?? undefined,
    );
    const labelById = new Map(labels.map(({ key, value }) => [key, value]));
    return newGroups.map((group) => ({
      ...group,
      label:
        (group.value !== null && labelById.get(group.value)) || group.label,
    }));
  };

  const fetchGroups = async (
    config: GroupByConfig,
    page: number,
    loadGeneration: number,
  ) => {
    const variables = options.getBaseVariables();
    const { results, count } = await options.fetchEntities({
      ...variables,
      limit: config.groupsPageSize ?? DEFAULT_GROUPS_PAGE_SIZE,
      skip: page,
      searchValue: {
        ...variables.searchValue,
        order_by: config.groupOrderBy,
        isAsc: false,
      },
      advancedFilterInputs: [
        ...baseFilters(variables),
        {
          type: AdvancedFilterTypes.Type,
          value: variables.type,
          distinct_by: config.distinctBy,
        },
      ],
    });
    if (loadGeneration !== generation) return [];

    const knownIds = new Set(
      page === 1 ? [] : groups.value.map(({ id }) => id),
    );
    const replacedValues = new Set(
      (config.pinnedGroups ?? [])
        .filter(
          ({ filterKey }) =>
            normalizedKey(filterKey) === normalizedKey(config.filterKey),
        )
        .map(({ value }) => value),
    );
    const distinctGroups = results
      .map((representative) => {
        const value = getGroupValue(representative, config.key);
        return {
          id: value ?? "",
          value,
          label: value ?? config.emptyLabel ?? "",
          translationKey: config.translationKey,
          entities: [],
          count: 0,
          page: 0,
          loading: true,
          hasMore: false,
        } as EntityGroup;
      })
      .filter(({ id }) => !knownIds.has(id) && !!knownIds.add(id));
    const newGroups = distinctGroups.filter(
      ({ value }) => value === null || !replacedValues.has(value),
    );

    const labelledGroups = await withResolvedLabels(config, newGroups);
    if (loadGeneration !== generation) return [];

    groupsCount.value = count;
    groupsPage.value = page;
    replacedGroupsCount.value =
      (page === 1 ? 0 : replacedGroupsCount.value) +
      distinctGroups.length -
      newGroups.length;
    const pinnedGroups =
      page === 1 ? (config.pinnedGroups ?? []).map(toPinnedGroup) : [];
    groups.value = [
      ...(page === 1 ? pinnedGroups : groups.value),
      ...labelledGroups,
    ];
    return [...pinnedGroups, ...labelledGroups];
  };

  const loadGroupsPage = async (page: number, loadGeneration: number) => {
    if (!activeConfig) return;
    const config = activeConfig;
    loading.value = true;
    try {
      const newGroups = await fetchGroups(config, page, loadGeneration);
      await Promise.all(
        newGroups.map((group) =>
          fetchGroupPage(config, group, 1, loadGeneration),
        ),
      );
    } finally {
      if (loadGeneration === generation) loading.value = false;
    }
  };

  const load = async (config: GroupByConfig) => {
    activeConfig = config;
    generation += 1;
    await loadGroupsPage(1, generation);
  };

  const loadMoreGroups = async () => {
    if (!hasMoreGroups.value || loading.value) return;
    await loadGroupsPage(groupsPage.value + 1, generation);
  };

  const loadMoreInGroup = async (groupId: string) => {
    const group = groups.value.find(({ id }) => id === groupId);
    if (!activeConfig || !group || group.loading || !group.hasMore) return;
    await fetchGroupPage(activeConfig, group, group.page + 1, generation);
  };

  const reset = () => {
    generation += 1;
    activeConfig = undefined;
    groups.value = [];
    groupsCount.value = 0;
    groupsPage.value = 0;
    replacedGroupsCount.value = 0;
    loading.value = false;
  };

  return {
    groups,
    groupsCount,
    hasMoreGroups,
    entities,
    loading,
    load,
    loadMoreGroups,
    loadMoreInGroup,
    reset,
  };
};
