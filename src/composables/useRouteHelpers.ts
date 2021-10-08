import { useRoute } from 'vue-router';
import { computed, ComputedRef } from 'vue';
import { urlParams } from '@/views';
import { asString } from '@/helpers';

export type noId = 'NOID';

const useRouteHelpers = (): {
  getParam: (input: urlParams) => string | noId;
  isSingle: ComputedRef<boolean>;
} => {
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

  return {
    getParam,
    isSingle,
  };
};

export default useRouteHelpers;
