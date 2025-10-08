import { ref } from "vue";
import { useRouter } from "vue-router";

type infoTypes = "routeType" | "parentRouteName" | "entityId" | "fullPath";

type PageInfo = {
  routeType: string;
  parentRouteName: string;
  entityId: string;
  fullPath: string;
};

const previousPageInfo = ref<PageInfo>({
  routeType: "",
  parentRouteName: "",
  entityId: "",
  fullPath: "",
});
const pageInfo = ref<PageInfo>({
  routeType: "",
  parentRouteName: "",
  entityId: "",
  fullPath: "",
});

export const usePageInfo = () => {
  const router = useRouter();

  const updatePageInfo = (input: string, type: infoTypes) => {
    if (!type) {
      console.error("Type is missing");
      return;
    }
    pageInfo.value[type] = input;
  };
  const updatePreviousPageInfo = (input: string, type: infoTypes) => {
    if (!type) {
      console.error("Type is missing");
      return;
    }
    previousPageInfo.value[type] = input;
  };

  const cleanupPreviousPageInfoByIdById = (deletedEntityId: string) => {
    if (
      previousPageInfo.value.fullPath &&
      previousPageInfo.value.fullPath.includes(deletedEntityId)
    ) {
      previousPageInfo.value = {
        routeType: "",
        parentRouteName: "",
        entityId: "",
        fullPath: "",
      };
    }
  };

  router.afterEach((to, from) => {
    const parentRouteTo = to.matched.length > 1 ? to.matched[1] : to.matched[0];
    updatePageInfo(parentRouteTo.name?.toString() || "", "parentRouteName");
    updatePageInfo(to.meta.type as string, "routeType");

    const parentRouteFrom =
      from.matched.length > 1 ? from.matched[1] : from.matched[0];
    updatePreviousPageInfo(
      parentRouteFrom.name?.toString() || "",
      "parentRouteName",
    );
    updatePreviousPageInfo(from.meta.type as string, "routeType");
    updatePreviousPageInfo(from.fullPath as string, "fullPath");
  });

  return {
    pageInfo,
    previousPageInfo,
    updatePageInfo,
    cleanupPreviousPageInfoById: cleanupPreviousPageInfoByIdById,
  };
};
