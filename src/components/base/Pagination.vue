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
      :fill="loading ? 'var(--colors-neutral-20)' : 'var(--colors-neutral-700)'"
      @click="prev"
    />
    <div class="inline-block text-sm mx-3" data-test="page-count-label">
      Page {{ currentPage }} of {{ maxPage }}
    </div>
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleRight.name"
      height="16"
      :fill="loading ? 'var(--colors-neutral-20)' : 'var(--colors-neutral-700)'"
      @click="next"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, computed } from 'vue';
  import { Unicons } from '@/types';

  export type paginationInfoType = {
    limit: number;
    skip: number;
    searchQuery: String;
  };

  export default defineComponent({
    name: 'Pagination',
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
      paginationInfo: {
        type: Object as PropType<paginationInfoType>,
        default: () => ({ limit: 20, skip: 0, searchQuery: 'asset' }),
        required: true,
      },
      maxPage: {
        type: Number,
        default: 1,
      },
    },
    emits: ['update:paginationInfo'],
    setup: (props, { emit }) => {
      const currentPage = computed<number>(() => props.paginationInfo.skip + 1);

      const next = () => {
        currentPage.value < props.maxPage &&
          emit('update:paginationInfo', {
            limit: props.paginationInfo.limit,
            skip: props.paginationInfo.skip + 1,
            searchQuery: props.paginationInfo.searchQuery,
          });
      };

      const prev = () => {
        currentPage.value > 1 &&
          emit('update:paginationInfo', {
            limit: props.paginationInfo.limit,
            skip: props.paginationInfo.skip - 1,
            searchQuery: props.paginationInfo.searchQuery,
          });
      };

      return {
        next,
        prev,
        currentPage,
        Unicons,
      };
    },
  });
</script>
