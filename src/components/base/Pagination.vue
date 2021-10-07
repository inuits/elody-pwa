<template>
  <div
    class="flex items-center"
    :class="{
      'bg-neutral-20 text-neutral-20': loading,
      'text-neutral-700': !loading,
    }"
  >
    <unicon
      v-if="currentPage > 1"
      class="cursor-pointer"
      :name="Unicons.AngleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(1)"
    />
    <unicon
      v-if="currentPage > 5"
      class="cursor-pointer"
      :name="Unicons.AngleDoubleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(5)"
    />
    <div class="flex text-sm mx-3 flex-row items-center w-1-6" data-test="page-count-label">
      Page {{currentPage}} of {{ maxPage() }}
    </div>
    <unicon
      v-if="currentPage <= maxPage()-5"
      class="cursor-pointer"
      :name="Unicons.AngleDoubleRight.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="next(5)"
    />
    <unicon
      v-if="currentPage <= maxPage()-1"
      class="cursor-pointer"
      :name="Unicons.AngleRight.name"
      height="16"
      :fill="loading ? 'var(--colors-neutral-20)' : 'var(--colors-neutral-700)'"
      @click="next(1)"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { Unicons } from '@/types';

  export type PaginationInfo = {
    limit: number;
    skip: number;
  };

  export default defineComponent({
    name: 'Pagination',
    props: {
      loading: { type: Boolean, default: false },
      limit: { type: Number, default: 20 },
      skip: { type: Number, default: 0 },
      totalItems: { type: Number, default: 1 },
    },
    emits: ['update:skip'],
    setup: (props, { emit }) => {
      const currentPage = computed(() => props.skip + 1);

      const maxPage = () => {
        if (props.totalItems > 1) return Math.ceil(props.totalItems / props.limit);
        else return 1;
      };

      const prev = (pages: number) => {
        if (currentPage.value - pages > 1) {
          emit('update:skip', props.skip - pages);
        }else emit('update:skip', 0);
      };
      const next = (pages: number) => {
        if (currentPage.value + pages <= maxPage()) {
          console.log(currentPage.value + pages);
          emit('update:skip', props.skip + pages);
        }else emit('update:skip', maxPage());
      };

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
