import { PageStatus } from "@/generated-types/queries";
import { computed, type ComputedRef, ref, watch } from "vue";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";

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
    const { clearBreadcrumbPathAndAddOverviewPage } = useBreadcrumbs({});
    if (currentPageStatus.value !== PageStatus.Success)
      clearBreadcrumbPathAndAddOverviewPage(currentPageStatus.value);
  },
);
