import { ref, computed, watchEffect } from "vue";
import { usePageInfo } from "./usePageInfo";
import { useRouter } from "vue-router";

export function useBreadcrumb() {
  const { pageInfo } = usePageInfo();

  const router = useRouter();
  const routes = router.options.routes;

  type BreadcrumbInfo = { entityTitle: string; path: string; entityId: string };

  const visitedPages = ref(<BreadcrumbInfo[]>[]);

  function addHomePage() {
    if (router.currentRoute.value.path === "/") {
      visitedPages.value.unshift({
        entityTitle: pageInfo.value.entityTitle,
        path: "/",
        entityId: pageInfo.value.entityId,
      });
    }
  }

  if (visitedPages.value.length === 0) {
    addHomePage();
  }

  const visitedPagesOptions = computed(() => {
    return visitedPages.value.length > 1
      ? visitedPages.value
        .map((page, index) => {
          return {
            label: page.entityTitle,
            value: index,
          };
        })
        .filter((page) => page.label)
        .reverse()
      : [];
  });

  const selectedVisitedPage = ref(visitedPages.value.length - 1);

  function addVisitedPage(info: BreadcrumbInfo) {
    const existingPage = visitedPages.value.find(
      (p) => p.entityId === info.entityId
    );
    if (!existingPage) {
      visitedPages.value.push({
        entityTitle: info.entityTitle,
        path: info.path,
        entityId: info.entityId,
      });
    }
  }

  function clearVisitedPages() {
    visitedPages.value = [];
    addHomePage();
  }

  function onVisitedPageChange(index: number) {
    const selectedPage = visitedPages.value[index];
    if (selectedPage) {
      const { entityTitle, path } = selectedPage;
      const matchedRoute = routes.find((route) => route.path === path);

      const routerTitle = matchedRoute?.meta?.title as string;
      const routeType = matchedRoute?.meta?.type as string;
      const parentRouteName = matchedRoute?.name as string;
      const entityId = matchedRoute?.meta?.uuid as string;

      pageInfo.value = {
        routerTitle,
        entityTitle,
        routeType,
        parentRouteName,
        entityId,
      };

      visitedPages.value.splice(index + 1);
      router.push(path);
    }
  }

  router.beforeEach((to, from, next) => {
    if (from.name) {
      visitedPages.value.pop();
      selectedVisitedPage.value = visitedPages.value.length - 1;
    }
    if (to.matched.length === 1) {
      clearVisitedPages();
      addVisitedPage({
        entityTitle: to.meta.title as string,
        path: to.path,
        entityId: to.meta.uuid as string,
      });
    }
    next();
  });

  const breadcrumb: BreadcrumbInfo = {
    entityTitle: pageInfo.value.entityTitle,
    path: "",
    entityId: pageInfo.value.entityId
  };

  watchEffect(() => {
    addVisitedPage(breadcrumb);
    selectedVisitedPage.value = visitedPages.value.length - 1;
  });

  return {
    pageInfo,
    visitedPagesOptions,
    selectedVisitedPage,
    showVisitedPages: computed(() => visitedPages.value.length > 1),
    entityTitle: computed(() => pageInfo.value.entityTitle),
    showEntityTitle: computed(() => pageInfo.value.entityTitle !== ""),
    addVisitedPage,
    clearVisitedPages,
    onVisitedPageChange,
  };
}