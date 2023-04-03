import { ref, computed, watchEffect } from "vue";
import { usePageInfo } from "./usePageInfo";
import { useRouter } from "vue-router";

export function useBreadcrumb() {
  const { pageInfo } = usePageInfo();

  const router = useRouter();
  const routes = router.options.routes;

  const visitedPages = ref([]);

  function addHomePage() {
    if (router.currentRoute.value.path === "/") {
      visitedPages.value.unshift({
        entityTitle: pageInfo.value.entityTitle,
        path: "/",
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

    selectedVisitedPage;
  });

  const selectedVisitedPage = ref(visitedPages.value.length - 1);

  function addVisitedPage(page) {
    const existingIndex = visitedPages.value.findIndex(
      (p) => p.entityTitle === page.entityTitle
    );
    if (existingIndex === -1) {
      visitedPages.value.push({
        entityTitle: page.entityTitle,
        path: page.path,
      });
    } else {
      const existingPage = visitedPages.value.splice(existingIndex, 1)[0];
      visitedPages.value.push(existingPage);
    }
  }

  function clearVisitedPages() {
    visitedPages.value = [];
    addHomePage();
  }

  function onVisitedPageChange(index) {
    const selectedPage = visitedPages.value[index];
    if (selectedPage) {
      const { entityTitle, path } = selectedPage;
      const matchedRoute = routes.find((route) => route.path === path);

      const routerTitle = matchedRoute?.meta?.title;
      const routeType = matchedRoute?.meta?.type;
      const parentRouteName = matchedRoute?.name;

      pageInfo.value = {
        routerTitle,
        entityTitle,
        routeType,
        parentRouteName,
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
        entityTitle: to.meta.title,
        path: to.path,
      });
    }
    next();
  });

  watchEffect(() => {
    addVisitedPage(pageInfo.value);
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
