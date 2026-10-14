import { ref } from "vue";
import {
  MenuBadgeSource,
  SearchInputType,
  type AdvancedFilterInput,
  type MenuBadge,
  type MenuItem,
} from "@/generated-types/queries";
import { apolloClient, router } from "@/main";
import { useImport } from "@/composables/useImport";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { useSeenItems } from "@/composables/useSeenItems";
import { seenTrackingOf } from "@/composables/useEntityPageConfig";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

type SeenCandidate = { id: string; activityAt: string | number | undefined };

const SEEN_ITEMS_FETCH_LIMIT = 200;

const counts = ref<Record<string, number>>({});
const seenCandidates = ref<Record<string, SeenCandidate[]>>({});

const badgeKeyOf = (badge: MenuBadge) =>
  [badge.source, badge.query, badge.filterQuery, badge.entityType].join("|");

const subMenuItemsOf = (menuItem: MenuItem): MenuItem[] =>
  Object.values(menuItem.subMenu ?? {}).filter(
    (subMenuItem: any) => subMenuItem?.typeLink,
  ) as MenuItem[];

const seenTrackingForType = (entityType: string): SeenTracking | undefined => {
  const route = router
    ?.getRoutes()
    .find(
      (registeredRoute) => registeredRoute.meta?.entityPageConfig?.[entityType],
    );
  return seenTrackingOf(route?.meta.entityPageConfig?.[entityType]);
};

const advancedFilterInputsOf = async (
  badge: MenuBadge,
): Promise<AdvancedFilterInput[]> => {
  if (!badge.filterQuery) return [];
  const { loadDocument } = useImport();
  const result = await apolloClient.query({
    query: await loadDocument(badge.filterQuery),
    variables: { entityType: badge.entityType },
    fetchPolicy: "no-cache",
  });
  const filtersManager = useFiltersBaseNew();
  filtersManager.initializeNewAdvancedFilters(
    result.data?.EntityTypeFilters?.advancedFilters,
  );
  return filtersManager.getNormalizedFiltersForApi();
};

const fetchBadge = async (badge: MenuBadge) => {
  const { loadDocument } = useImport();
  const isSeenItems = badge.source === MenuBadgeSource.SeenItems;
  const result = await apolloClient.query({
    query: await loadDocument(badge.query),
    variables: {
      type: badge.entityType,
      limit: isSeenItems ? SEEN_ITEMS_FETCH_LIMIT : 1,
      skip: 1,
      searchValue: { value: "", isAsc: undefined, key: "title", order_by: "" },
      advancedSearchValue: [],
      advancedFilterInputs: await advancedFilterInputsOf(badge),
      searchInputType: SearchInputType.AdvancedInputType,
    },
    fetchPolicy: "no-cache",
  });
  const entities = result.data?.Entities;
  const key = badgeKeyOf(badge);

  if (!isSeenItems) {
    counts.value[key] = entities?.count ?? 0;
    return;
  }
  const activityKey = seenTrackingForType(badge.entityType)?.activityKey;
  seenCandidates.value[key] = (entities?.results ?? []).map((entity: any) => ({
    id: entity.id,
    activityAt: activityKey ? entity.intialValues?.[activityKey] : undefined,
  }));
};

export const useMenuBadges = () => {
  const { isNew } = useSeenItems();

  const refreshBadges = async (menuItems: MenuItem[]) => {
    const badges = new Map<string, MenuBadge>();
    menuItems
      .flatMap((menuItem) => [menuItem, ...subMenuItemsOf(menuItem)])
      .forEach((menuItem) => {
        if (menuItem.badge)
          badges.set(badgeKeyOf(menuItem.badge), menuItem.badge);
      });
    await Promise.allSettled([...badges.values()].map(fetchBadge));
  };

  const newItemIdsOf = (badge: MenuBadge): string[] => {
    const ttlDays = seenTrackingForType(badge.entityType)?.ttlDays;
    return (seenCandidates.value[badgeKeyOf(badge)] ?? [])
      .filter((candidate) =>
        isNew(candidate.id, candidate.activityAt, ttlDays),
      )
      .map((candidate) => candidate.id);
  };

  const fetchedCountOf = (badge: MenuBadge): number =>
    counts.value[badgeKeyOf(badge)] ?? 0;

  const isSeenItemsBadge = (badge: MenuBadge): boolean =>
    badge.source === MenuBadgeSource.SeenItems;

  const badgeCountOf = (menuItem: MenuItem): number => {
    const badge = menuItem.badge;
    if (!badge) return 0;
    if (isSeenItemsBadge(badge)) return newItemIdsOf(badge).length;
    return fetchedCountOf(badge);
  };

  const badgesInTotalOf = (menuItem: MenuItem): MenuBadge[] => {
    const menuItems = menuItem.showChildBadgeTotal
      ? [menuItem, ...subMenuItemsOf(menuItem)]
      : [menuItem];
    return menuItems
      .map((item) => item.badge)
      .filter((badge): badge is MenuBadge => !!badge);
  };

  const totalBadgeCountOf = (menuItem: MenuItem): number => {
    const uniqueNewItemIds = new Set<string>();
    let fetchedCount = 0;

    for (const badge of badgesInTotalOf(menuItem)) {
      if (isSeenItemsBadge(badge)) {
        newItemIdsOf(badge).forEach((id) => uniqueNewItemIds.add(id));
      } else {
        fetchedCount += fetchedCountOf(badge);
      }
    }

    return uniqueNewItemIds.size + fetchedCount;
  };

  return { refreshBadges, badgeCountOf, totalBadgeCountOf };
};
