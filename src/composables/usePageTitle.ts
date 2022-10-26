import { ref } from "vue";
import { useRouter } from "vue-router";

type titleTypes = "routerTitle" | "entityTitle";

type PageTitle = {
  routerTitle: string;
  entityTitle: string;
};

const pageTitle = ref<PageTitle>({
  routerTitle: "",
  entityTitle: "",
});

export const usePageTitle = () => {
  const router = useRouter();

  const updatePageTitle = (input: string, type: titleTypes = "routerTitle") => {
    pageTitle.value[type] = input;
  };

  router.beforeEach((to, _from, next) => {
    updatePageTitle("", "entityTitle");

    next();
  });

  router.afterEach((to) => {
    updatePageTitle(to.meta.title as string);
  });

  return {
    pageTitle,
    updatePageTitle,
  };
};
