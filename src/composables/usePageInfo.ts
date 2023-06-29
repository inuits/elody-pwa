import { ref } from "vue";
import { useRouter } from "vue-router";

type infoTypes = "routerTitle" | "routeType" | "parentRouteName" | "entityId";

type PageInfo = {
  routerTitle: string;
  routeType: string;
  parentRouteName: string;
  entityId: string;
};

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

  router.afterEach((to) => {
    updatePageInfo(to.matched[0].name?.toString() || "", "parentRouteName");
    updatePageInfo(to.meta.type as string, "routeType");
    updatePageInfo(to.meta.title as string);
    updatePageInfo(to.meta.uuid as string);
  });

  return {
    pageInfo,
    updatePageInfo,
  };
};
