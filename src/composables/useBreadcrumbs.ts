import { DamsIcons, Entitytyping, RouteNames } from "@/generated-types/queries";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getChildrenOfHomeRoutes } from "@/helpers";

export type VisitedRoute = {
  id: string;
  routeName: string;
  icon?: DamsIcons;
  path?: string;
};
export type RootRoute = {
  rootId: string;
  rootTitle: string;
}
export type EntityTypeWithId = {
  id: string;
  entityType: Entitytyping;
}
export type BreadcrumbRoute = {
  id: string;
  title: string;
  overviewPage: string;
  type: string;
}

const breadcrumbRoutes = ref<BreadcrumbRoute[]>([]);
const rootRoute = ref<RootRoute>({});

const useBreadcrumbs = (config: any) => {
  const homeRoutes = getChildrenOfHomeRoutes(config);
  const previousRoute = computed<VisitedRoute | undefined>(() => breadcrumbRoutes.value[breadcrumbRoutes.value.length - 1]);

  const getRouteBreadcrumbsOfEntity = (entitytype: Entitytyping): any => {
    const entityRoute = homeRoutes.filter((item: any) => item.meta.entityType?.toLowerCase() === entitytype.toLowerCase())[0];
    if (!entityRoute) return;
    return entityRoute.meta.breadcrumbs;
  }

  const addParentToBreadcrumb = (routeBreadcrumbs: any, relationValues: any): EntityTypeWithId => {
    let idOfParent: string;
    const returnObject: EntityTypeWithId = {};
    for (const index in routeBreadcrumbs) {
      if (!relationValues || relationValues[routeBreadcrumbs[index].relation] === undefined) continue;
      idOfParent = relationValues[routeBreadcrumbs[index].relation][0].key;
      if (idOfParent === getRootRouteId()) break;
      if (breadcrumbRoutes.value.filter(item => item.id === idOfParent).length > 0) break;
      returnObject.id = idOfParent;
      returnObject.entityType = routeBreadcrumbs[index].entityType;
      breadcrumbRoutes.value.unshift({ id: idOfParent, type: routeBreadcrumbs[index].entityType });
      break;
    }
    if (!returnObject.id) addOverviewPageToBreadcrumb(routeBreadcrumbs);
    return returnObject;
  }

  const addOverviewPageToBreadcrumb = (routeBreadcrumbs: any) => {
    const routeBreadcrumbsWithOverviewPage = routeBreadcrumbs[routeBreadcrumbs.length - 1];
    breadcrumbRoutes.value.unshift({ title: routeBreadcrumbsWithOverviewPage.overviewPage, overviewPage: routeBreadcrumbsWithOverviewPage.overviewPage });
  }

  const addTitleToBreadcrumb = (title: string) => {
    breadcrumbRoutes.value[0].title = title;
  }

  const getFullBreadcrumbPath = (): BreadcrumbRoute[] => {
    return breadcrumbRoutes.value;
  }

  const clearBreadcrumbPath = (): void => {
    breadcrumbRoutes.value = [];
  }

  const clearBreadcrumbPathAndAddOverviewPage = (title: string): void => {
    setRootRoute(undefined, title);
    clearBreadcrumbPath();
  }

  const setRootRoute = (id: string, title: string): void => {
    rootRoute.value.rootId = id;
    rootRoute.value.rootTitle = title;
  }

  const getRootRouteId = (): string => {
    return rootRoute.value.rootId;
  }

  useRouter().afterEach((to) => {
    try {
      if (to.meta.title !== "Single Asset" && to.meta.title !== "Single Entity")
        clearBreadcrumbPathAndAddOverviewPage(to.meta.breadcrumbs[to.meta.breadcrumbs.length - 1].overviewPage as string);
    } catch (e) {
    }
  });

  return {
    addParentToBreadcrumb,
    addTitleToBreadcrumb,
    clearBreadcrumbPath,
    clearBreadcrumbPathAndAddOverviewPage,
    getFullBreadcrumbPath,
    getRouteBreadcrumbsOfEntity,
    setRootRoute,
    previousRoute,
  }
}

export {
  useBreadcrumbs,
  breadcrumbRoutes,
  rootRoute,
}