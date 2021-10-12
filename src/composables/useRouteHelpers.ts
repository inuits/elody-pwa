import { useRoute } from 'vue-router';
import { computed, ComputedRef } from 'vue';
import { urlParams } from '@/views';
import { asString } from '@/helpers';
import { PaginationInfo } from '@/queries';
import { useRouter } from 'vue-router';

export type noId = 'NOID';

const useRouteHelpers = (): {
  getParam: (input: urlParams) => string | noId;
  isSingle: ComputedRef<boolean>;
  getPaginationInfoFromUrl: (info: PaginationInfo) => PaginationInfo;
  updatePaginationInfoQueryParams: (info: PaginationInfo) => void;
} => {
  const router = useRouter();
  const route = useRoute();
  const isSingle = computed<boolean>(() => route.name === 'SingleEntity');

  const getParam = (input: urlParams) => {
    const param = useRoute().params[input];

    if (param) {
      return asString(param);
    } else {
      return 'NOID';
    }
  };

  const getPaginationInfoFromUrl = (info: PaginationInfo) => {
    if (route.query.page || route.query.items) {
      info.skip = Number(route.query.page);
      info.limit = Number(route.query.items);
      updatePaginationInfoQueryParams(info);
    }
    updatePaginationInfoQueryParams(info);
    return { limit: info.limit, skip: info.skip } as PaginationInfo;
  };

  const updatePaginationInfoQueryParams = (info: PaginationInfo) => {
    if (info.skip == 0) {
      router.replace({ query: { items: info.limit, page: info.skip + 1 } });
    } else {
      router.replace({ query: { items: info.limit, page: info.skip } });
    }
    if (info.limit && info.limit > 20) {
      router.replace({ query: { items: 20, page: info.skip } });
    } else {
      router.replace({ query: { items: info.limit, page: info.skip } });
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
