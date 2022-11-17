import { ref } from "vue";
import { useRouter } from "vue-router";

type infoTypes = "routerTitle" | "entityTitle" | "routeType";

type PageInfo = {
  routerTitle: string;
  entityTitle: string;
  routeType: string;
};

const pageInfo = ref<PageInfo>({
  routerTitle: "",
  entityTitle: "",
  routeType: "",
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
    updatePageInfo(to.meta.type as string, "routeType");
    updatePageInfo(to.meta.title as string);
  });

  return {
    pageInfo,
    updatePageInfo,
  };
};
