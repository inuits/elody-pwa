import { useRoute } from "vue-router";
import { computed } from "vue";
import type { ComputedRef } from "vue";
import type { urlParams } from "@/views";
import { asString } from "@/helpers";
import type { PaginationInfo } from "@/queries";
import { useRouter } from "vue-router";

export type noId = "NOID";

const useRouteHelpers = (): {
  getParam: (input: urlParams) => string | noId;
  isSingle: ComputedRef<boolean>;
  getPaginationInfoFromUrl: (info: PaginationInfo) => PaginationInfo;
  updatePaginationInfoQueryParams: (info: PaginationInfo) => void;
} => {
  const router = useRouter();
  const route = useRoute();
  const isSingle = computed<boolean>(
    () => route.name === "SingleEntity" || route.name === "SingleMediafile"
  );

  const getParam = (input: urlParams) => {
    const param = useRoute().params[input];

    if (param) {
      return asString(param);
    } else {
      return "NOID";
    }
  };

  const getPaginationInfoFromUrl = (info: PaginationInfo) => {
    if (route.query.page || route.query.items) {
      info.skip = Number(route.query.page);
      info.limit = Number(route.query.items);
      if (info.limit > 20) info.limit = 20;
      updatePaginationInfoQueryParams(info);
    }
    updatePaginationInfoQueryParams(info);
    return { limit: info.limit, skip: info.skip } as PaginationInfo;
  };

  const updatePaginationInfoQueryParams = (info: PaginationInfo) => {
    if ((info.limit && info.skip) || (info.skip == 0 && info.limit)) {
      if (info.limit > 20 || info.skip < 1) {
        router.replace({ query: { items: 20, page: 1 } });
      } else {
        router.replace({ query: { items: info.limit, page: info.skip } });
      }
    } else {
      router.replace({ query: { items: 20, page: 1 } });
    }
  };

  return {
    getParam,
    isSingle,
    getPaginationInfoFromUrl,
    updatePaginationInfoQueryParams,
  };
};

export default useRouteHelpers;
