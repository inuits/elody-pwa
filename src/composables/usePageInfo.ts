import { ref } from "vue";
import { useRouter } from "vue-router";

type infoTypes = "routerTitle" | "routeType" | "parentRouteName" | "entityId" | "fullPath";

type PageInfo = {
  routerTitle: string;
  routeType: string;
  parentRouteName: string;
  entityId: string;
  fullPath: string;
};

const previousPageInfo = ref<PageInfo>({
  routerTitle: "",
  routeType: "",
  parentRouteName: "",
  entityId: "",
  fullPath: "",
});
const pageInfo = ref<PageInfo>({
  routerTitle: "",
  routeType: "",
  parentRouteName: "",
  entityId: "",
});

export const usePageInfo = () => {
  const router = useRouter();

  const updatePageInfo = (input: string, type: infoTypes = "routerTitle") => {
    pageInfo.value[type] = input;
  };
  const updatePreviousPageInfo = (
    input: string,
    type: infoTypes = "routerTitle"
  ) => {
    previousPageInfo.value[type] = input;
  };

  router.afterEach((to, from) => {
    const parentRouteTo = to.matched.length > 1 ? to.matched[1] : to.matched[0];
    updatePageInfo(parentRouteTo.name?.toString() || "", "parentRouteName");
    updatePageInfo(to.meta.type as string, "routeType");
    updatePageInfo(to.meta.title as string);
    updatePageInfo(to.meta.uuid as string);

    const parentRouteFrom =
      from.matched.length > 1 ? from.matched[1] : from.matched[0];
    updatePreviousPageInfo(
      parentRouteFrom.name?.toString() || "",
      "parentRouteName"
    );
    updatePreviousPageInfo(from.meta.type as string, "routeType");
    updatePreviousPageInfo(from.meta.title as string);
    updatePreviousPageInfo(from.meta.uuid as string);
    updatePreviousPageInfo(from.fullPath as string, "fullPath");
  });

  return {
    pageInfo,
    previousPageInfo,
    updatePageInfo,
  };
};
