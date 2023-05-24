<template>
  <div class="flex items-center">
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleDoubleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(5)"
    />
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleLeft.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="prev(1)"
    />
    <div
      class="flex text-sm mx-3 flex-row items-center w-1-6"
      data-test="page-count-label"
    >
      {{ $t("partials.page") }}
      <input
        class="mx-2 w-16 rounded-lg"
        type="number"
        :max="maxPage()"
        :min="1"
        v-model="currentPage"
      />{{}}
      {{ $t("partials.of") }}
      {{ maxPage() }}
    </div>
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleRight.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--colors-neutral-700)'"
      @click="next(1)"
    />
    <unicon
      class="cursor-pointer"
      :name="Unicons.AngleDoubleRight.name"
      height="16"
      :fill="loading ? 'var(--color-neutral-20)' : 'var(--color-neutral-700)'"
      @click="next(5)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref, watch } from "vue";
import { Unicons } from "@/types";

export type PaginationInfo = {
  limit: number;
  skip: number;
};

export const paginationLimits = [20, 50, 100];

export default defineComponent({
  name: "BasePagination",
  props: {
    loading: { type: Boolean, default: false },
    limit: { type: Number, default: 20 },
    skip: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  emits: ["update:skip", "update:limit"],
  setup: (props, { emit }) => {
    // const helper = useRouteHelpers();
    let paginationInfo = reactive<PaginationInfo>({
      limit: props.limit,
      skip: props.skip,
    });

    const currentPage = ref<number>(props.skip);

    const prev = (pages: number) => {
      if (!props.loading) {
        if (currentPage.value - pages > 1) {
          emit("update:skip", props.skip - pages);
          emit("update:limit", props.limit);
        } else {
          emit("update:skip", 1);
          emit("update:limit", props.limit);
        }
      }
    };

    const next = (pages: number) => {
      if (!props.loading) {
        if (currentPage.value + pages <= maxPage()) {
          emit("update:skip", props.skip + pages);
          emit("update:limit", props.limit);
        } else {
          emit("update:skip", maxPage());
          emit("update:limit", props.limit);
        }
      }
    };

    const goToPageNumber = (page: number) => {
      if (!props.loading) {
        if (page <= maxPage()) {
          emit("update:skip", page);
          emit("update:limit", props.limit);
        } else {
          emit("update:skip", maxPage());
          emit("update:limit", props.limit);
        }
      }
    };

    const maxPage = () => {
      if (props.totalItems > 1)
        return Math.ceil(props.totalItems / props.limit);
      else return 1;
    };

    const init = () => {
      if (paginationInfo.skip == 0 || paginationInfo.skip > maxPage()) {
        emit("update:skip", 0);
        emit("update:limit", paginationInfo.limit);
      } else {
        emit("update:skip", paginationInfo.skip);
        emit("update:limit", paginationInfo.limit);
      }
    };
    init();

    watch(
      () => currentPage.value,
      () => {
        if (currentPage.value) {
          goToPageNumber(currentPage.value);
        }
      }
    );

    watch(
      () => props.skip,
      () => {
        currentPage.value = props.skip;
      }
    );

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
