import { computed, readonly, ref, watch } from "vue";
import { isCountCapped, getListingCountCap } from "@/composables/useResultCount";

export const createPaginationStore = () => {
  const skip = ref(1);
  const currentPage = ref(1);
  const limit = ref(20);
  const totalAmount = ref(0);
  // Set once the user reveals the on-demand exact total (see useBaseLibrary's
  // revealExactCount). Overrides the capped totalAmount so pagination unlocks
  // to the real page count instead of staying bounded to the cap. Cleared
  // (null) whenever the listing changes and the exact total is no longer known.
  const exactAmount = ref<number | null>(null);

  // When collection-api caps the count it returns `cap + 1` as a sentinel. The
  // exact total is unknown, so we bound navigation to the cap and flag the last
  // page as an estimate ("50+") instead of letting `ceil((cap + 1) / limit)`
  // produce a misleading extra, empty page. Once the exact total is revealed,
  // navigation unlocks to the real total instead.
  const countIsCapped = computed(
    () => exactAmount.value == null && isCountCapped(totalAmount.value),
  );
  const navigableAmount = computed(() => {
    if (exactAmount.value != null) return exactAmount.value;
    return countIsCapped.value ? getListingCountCap() : totalAmount.value;
  });

  const totalPages = computed(() =>
    Math.ceil(navigableAmount.value / limit.value),
  );
  const hasNextPage = computed(() => currentPage.value < totalPages.value);
  const canUpdateSkip = ref<boolean>(true);

  // general functions to set the page and update skip accordingly
  const setPage = (page: number) => {
    if (page === currentPage.value) return;
    currentPage.value = page;
    skip.value = page;
  };

  const updateTotalAmount = (newTotal: number) => {
    totalAmount.value = newTotal;
  };

  const updateExactAmount = (exactTotal: number | null) => {
    exactAmount.value = exactTotal;
  };

  const setLimit = (newLimit: number) => {
    if (newLimit === limit.value) return;
    limit.value = newLimit;
    setPage(1);
  };

  // methods to navigate pages within components
  const canUpdateSkipAgain = () => {
    canUpdateSkip.value = true;
  };

  const previous = () => {
    if (currentPage.value <= 1) return;
    setPage(currentPage.value - 1);
  };

  const next = () => {
    if (currentPage.value >= getLastPage()) return;
    setPage(currentPage.value + 1);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > getLastPage()) return;
    setPage(page);
  };

  const getLastPage = () => {
    if (navigableAmount.value > 0)
      return Math.ceil(navigableAmount.value / limit.value) || 1;
    else return 1;
  };

  watch(
    [limit, totalAmount, exactAmount],
    () => {
      if (currentPage.value > getLastPage()) {
        setPage(1);
      }
    },
  );

  return {
    skip: readonly(skip),
    currentPage,
    setPage,
    goToPage,
    previous,
    next,
    updateTotalAmount,
    updateExactAmount,
    setLimit,
    canUpdateSkipAgain,
    getLastPage,
    limit,
    hasNextPage,
    totalPages,
    countIsCapped,
  };
};

export type PaginationStore = ReturnType<typeof createPaginationStore>;
export const PaginationStoreKey = Symbol("PaginationStore");
