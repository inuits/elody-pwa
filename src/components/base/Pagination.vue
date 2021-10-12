<template>
  <div
    class="flex items-center"
    :class="{
      'bg-neutral-20 text-neutral-20': loading,
      'text-neutral-700': !loading,
    }"
  >
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(1)"
    />
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleDoubleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(5)"
    />
    <div
      class="flex text-sm mx-3 flex-row items-center w-1-6"
      data-test="page-count-label"
    >
      Page {{ currentPage }} of {{ maxPage() }}
    </div>
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleDoubleRight.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="next(5)"
    />
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleRight.name"
      height="16"
      :fill="loading ? 'var(--colors-neutral-20)' : 'var(--colors-neutral-700)'"
      @click="next(1)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue';
import { Unicons } from '@/types';
import useRouteHelpers from '@/composables/useRouteHelpers';

export type PaginationInfo = {
  limit: number;
  skip: number;
};

export const paginationLimits = [5,10,15,20];

export default defineComponent({
  name: 'Pagination',
  props: {
    loading: { type: Boolean, default: false },
    limit: { type: Number, default: 20 },
    skip: { type: Number, default: 1 },
    totalItems: { type: Number, default: 1 },
  },
  emits: ['update:skip', 'update:limit'],
  setup: (props, { emit }) => {
    const helper = useRouteHelpers();
    let paginationInfo = reactive<PaginationInfo>({
      limit: props.limit,
      skip: props.skip,
    });

    const currentPage = computed(() => {
      return props.skip;
    });

    const prev = (pages: number) => {
      if (currentPage.value - pages > 1) {
        helper.updatePaginationInfoQueryParams({
          limit: props.limit,
          skip: props.skip - pages,
        });
        emit('update:skip', props.skip - pages);
        emit('update:limit', props.limit);
      } else {
        helper.updatePaginationInfoQueryParams({ limit: props.limit, skip: 1 });
        emit('update:skip', 1);
        emit('update:limit', props.limit);
      }
    };

    const next = (pages: number) => {
      if (currentPage.value + pages <= maxPage()) {
        helper.updatePaginationInfoQueryParams({
          limit: props.limit,
          skip: props.skip + pages,
        });
        emit('update:skip', props.skip + pages);
        emit('update:limit', props.limit);
      } else {
        helper.updatePaginationInfoQueryParams({ limit: props.limit, skip: maxPage() });
        emit('update:skip', maxPage());
        emit('update:limit', props.limit);
      }
    };
    const maxPage = () => {
      if (props.totalItems > 1) return Math.ceil(props.totalItems / props.limit);
      else return 1;
    };

    const init = () => {
      paginationInfo = helper.getPaginationInfoFromUrl({
        limit: props.limit,
        skip: props.skip,
      }) as PaginationInfo;
      if (paginationInfo.skip == 0 || paginationInfo.skip > maxPage()) {
        helper.updatePaginationInfoQueryParams({ limit: props.limit, skip: 1 });
        emit('update:skip', 1);
        emit('update:limit', paginationInfo.limit);
      } else {
        emit('update:skip', paginationInfo.skip);
        emit('update:limit', paginationInfo.limit);
      }
    };
    init();

    return {
      currentPage,
      Unicons,
      maxPage,
      prev,
      next,
    };
  },
});
</script>
