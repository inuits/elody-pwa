import { ref } from "vue";
import { useRouter } from "vue-router";

type infoTypes =
  | "routerTitle"
  | "entityTitle"
  | "routeType"
  | "parentRouteName";

type PageInfo = {
  routerTitle: string;
  entityTitle: string;
  routeType: string;
  parentRouteName: string;
};

const pageInfo = ref<PageInfo>({
  routerTitle: "",
  entityTitle: "",
  routeType: "",
  parentRouteName: "",
});

export const usePageInfo = () => {
  const router = useRouter();

  const updatePageInfo = (input: string, type: infoTypes = "routerTitle") => {
    pageInfo.value[type] = input;
  };

  router.beforeEach((to, _from, next) => {
    updatePageInfo("", "entityTitle");

    next();
  });

  router.afterEach((to) => {
    updatePageInfo(to.matched[0].name?.toString() || "Home", "parentRouteName");
    updatePageInfo(to.meta.type as string, "routeType");
    updatePageInfo(to.meta.title as string);
  });

  return {
    pageInfo,
    updatePageInfo,
  };
};
