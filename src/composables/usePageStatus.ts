import { PageStatus } from "@/generated-types/queries";
import { computed, type ComputedRef, ref, watch } from "vue";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useRouter } from "vue-router";

const currentPageStatus = ref<PageStatus>(PageStatus.Success);

export const usePageStatus: () => {
  pageStatus: ComputedRef<PageStatus>;
  setPageStatus: (pageStatus: PageStatus) => void;
  resetPageStatus: () => void;
} = () => {
  const pageStatus = computed(() => currentPageStatus.value);

  const setPageStatus = (pageStatus: PageStatus): void => {
    currentPageStatus.value = pageStatus;
  };

  const resetPageStatus = (): void => {
    setPageStatus(PageStatus.Success);
  };

  return { pageStatus, setPageStatus, resetPageStatus };
};

watch(
  () => currentPageStatus.value,
  () => {
    const router = useRouter();
    if (!router) return;
    const isDetailPage = !!router.currentRoute.value.params["id"];
    if (!isDetailPage) return;
    const { clearBreadcrumbPathAndAddOverviewPage } = useBreadcrumbs({});
    if (currentPageStatus.value !== PageStatus.Success)
      clearBreadcrumbPathAndAddOverviewPage(currentPageStatus.value);
  },
);
