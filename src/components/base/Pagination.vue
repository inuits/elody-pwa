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
  import { defineComponent, computed } from 'vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'Pagination',
    props: {
      loading: { type: Boolean, default: false },
      limit: { type: Number, default: 20 },
      skip: { type: Number, default: 0 },
      maxPage: { type: Number, default: 1 },
    },
    emits: ['update:skip'],
    setup: (props, { emit }) => {
      const currentPage = computed(() => props.skip + 1);

      return {
        currentPage,
        Unicons,
        prev() {
          if (currentPage.value > 1) {
            emit('update:skip', props.skip - 1);
          }
        },
        next() {
          if (currentPage.value < props.maxPage) {
            emit('update:skip', props.skip + 1);
          }
        },
      };
    },
  });
</script>
