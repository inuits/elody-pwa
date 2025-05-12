import type { DamsIcons, Entitytyping } from "@/generated-types/queries";
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  type Entity,
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  SearchInputType,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { getChildrenOfHomeRoutes, getTitleOrNameFromEntity } from "@/helpers";
import { useRegexChecker } from "@/composables/useRegexChecker";

export type VisitedRoute = {
  id: string;
  routeName: string;
  icon?: DamsIcons;
  path?: string;
};
export type RootRoute = {
  rootId: string;
  rootTitle: string;
};
export type BreadcrumbRoute = {
  id: string;
  title: string;
  overviewPage: string;
  type: string;
};

const rootRoute = ref<RootRoute>({});
const breadcrumbRoutes = ref<BreadcrumbRoute[]>([]);
const breadcrumbPathFinished = ref<boolean>(false);
const { checkRegexForOneWayRelations } = useRegexChecker();

const useBreadcrumbs = (config: any) => {
  const homeRoutes = getChildrenOfHomeRoutes(config);
  const previousRoute = computed<VisitedRoute | undefined>(
    () => breadcrumbRoutes.value[breadcrumbRoutes.value.length - 1],
  );

  const getRouteBreadcrumbsOfEntity = (
    entitytype: Entitytyping | string,
  ): any => {
    const entityRoute = homeRoutes.filter(
      (item: any) =>
        item.meta.entityType?.toLowerCase() === entitytype?.toLowerCase() ||
        item.meta.slug?.toLowerCase() === entitytype?.toLowerCase(),
    )[0];
    if (!entityRoute) return;
    return entityRoute.meta.breadcrumbs;
  };

  const iterateOverBreadcrumbs = async (
    parentId: string[],
    routeBreadcrumbs: any,
    modifyBreadcrumbRoutesArray: boolean,
    entity: Entity | undefined = undefined,
  ) => {
    let entities: Entity[] = [];
    for (const index in routeBreadcrumbs) {
      if (routeBreadcrumbs[index].overviewPage && modifyBreadcrumbRoutesArray) {
        addOverviewPageToBreadcrumb(routeBreadcrumbs);
        break;
      }
      const entityType = routeBreadcrumbs[index].entityType;
      const relation = routeBreadcrumbs[index].relation;
      const key = routeBreadcrumbs[index].key;
      entities = await fetchRelationsBasedOnEntityType(
        createFilters(parentId, entityType, relation, key, entity),
      );
      if (entities.length > 0 && modifyBreadcrumbRoutesArray) {
        const idOfParent = entities[0].id;
        if (
          idOfParent === getRootRouteId() ||
          breadcrumbRoutes.value.filter((item) => item.id === idOfParent)
            .length > 0
        ) {
          addOverviewPageToBreadcrumb(routeBreadcrumbs);
          entities = undefined;
        } else
          breadcrumbRoutes.value.unshift({
            id: idOfParent,
            type: entityType,
            title: getTitleOrNameFromEntity(entities[0]),
          });
        break;
      }
    }
    return entities ? entities[0] : undefined;
  };

  const addOverviewPageToBreadcrumb = (routeBreadcrumbs: any) => {
    const routeBreadcrumbsWithOverviewPage =
      routeBreadcrumbs[routeBreadcrumbs.length - 1];
    breadcrumbRoutes.value.unshift({
      title:
        routeBreadcrumbsWithOverviewPage.title ??
        routeBreadcrumbsWithOverviewPage.overviewPage,
      overviewPage: routeBreadcrumbsWithOverviewPage.overviewPage,
    });
    breadcrumbPathFinished.value = true;
  };

  const addTitleToBreadcrumb = (title: string) => {
    breadcrumbRoutes.value[0].title = title;
  };

  const getFullBreadcrumbPath = (): BreadcrumbRoute[] => {
    return breadcrumbRoutes.value;
  };

  const clearBreadcrumbPath = (): void => {
    breadcrumbRoutes.value = [];
    breadcrumbPathFinished.value = false;
  };

  const clearBreadcrumbPathAndAddOverviewPage = (title: string): void => {
    setRootRoute(undefined, title);
    clearBreadcrumbPath();
  };

  const setRootRoute = (id: string, title: string): void => {
    rootRoute.value.rootId = id;
    rootRoute.value.rootTitle = title;
  };

  const getRootRouteId = (): string => {
    return rootRoute.value.rootId;
  };

  const createFilters = (
    parentId: string[],
    entityType: Entitytyping,
    relation: string,
    key?: string | undefined,
    entity?: Entity | undefined,
  ) => {
    const advancedFilters: AdvancedFilterInput[] = [
      {
        match_exact: true,
        type: AdvancedFilterTypes.Type,
        value: entityType,
      },
    ];
    const [matchesRegex, ids] = checkRegexForOneWayRelations(relation, entity);
    if (matchesRegex)
      advancedFilters.push({
        match_exact: true,
        type: AdvancedFilterTypes.Selection,
        key: key,
        value: ids,
      });
    else
      advancedFilters.push({
        match_exact: true,
        type: AdvancedFilterTypes.Selection,
        key: [`elody:1|relations.${relation}.key`],
        value: parentId,
      });
    const queryVariables: GetEntitiesQueryVariables = {
      type: entityType,
      limit: 20,
      skip: 1,
      searchValue: {
        value: "",
        isAsc: false,
        key: "title",
        order_by: "date_updated",
      },
      searchInputType: SearchInputType.AdvancedInputType,
      advancedSearchValue: [],
      advancedFilterInputs: advancedFilters,
    };
    return queryVariables;
  };

  const fetchRelationsBasedOnEntityType = async (
    queryVariables: GetEntitiesQueryVariables,
  ) => {
    let entities: Entity[] = [];
    await apolloClient
      .query({
        query: GetEntitiesDocument,
        variables: queryVariables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const fetchedEntities = result.data.Entities;
        entities = fetchedEntities?.results as Entity[];
      })
      .catch(() => {
        entities = [];
      });
    return entities;
  };

  useRouter()?.afterEach((to) => {
    if (to.meta.title === "Single Asset" || to.meta.title === "Single Entity")
      return;
    const overviewPage = to.meta.breadcrumbs[to.meta.breadcrumbs.length - 1];
    clearBreadcrumbPathAndAddOverviewPage(
      overviewPage.title ?? (overviewPage.overviewPage as string),
    );
  });

  return {
    addTitleToBreadcrumb,
    clearBreadcrumbPath,
    clearBreadcrumbPathAndAddOverviewPage,
    getFullBreadcrumbPath,
    getRouteBreadcrumbsOfEntity,
    setRootRoute,
    previousRoute,
    iterateOverBreadcrumbs,
    createFilters,
    addOverviewPageToBreadcrumb,
  };
};

export { useBreadcrumbs, breadcrumbRoutes, rootRoute, breadcrumbPathFinished };
