<template>
  <!-- templates/elody-list-screen: « ‹ page [n] of N › », real buttons. -->
  <nav
    :aria-label="$t('pagination.label')"
    class="flex items-center gap-(--pager-gap) text-label text-text-panel-header select-none"
  >
    <button
      type="button"
      data-cy="pager-first"
      :class="buttonClasses"
      :aria-label="$t('pagination.first')"
      :disabled="currentPage <= 1"
      @click="paginationStore.goToPage(1)"
    >
      <unicon :name="Unicons.AngleDoubleLeft.name" height="16" />
    </button>
    <button
      type="button"
      data-cy="pager-previous"
      :class="buttonClasses"
      :aria-label="$t('pagination.previous')"
      :disabled="currentPage <= 1"
      @click="paginationStore.previous()"
    >
      <unicon :name="Unicons.AngleLeft.name" height="16" />
    </button>
    <span class="px-1">{{ $t("pagination.page") }}</span>
    <BaseInputTextNumberDatetime
      v-model="localPage"
      class="w-(--pager-input-width) text-center font-bold"
      type="number"
      input-style="defaultWithBorder"
      :aria-label="$t('pagination.page-number')"
      @keyup.enter="updatePage"
      @focusout="updatePage"
    />
    <span class="px-1">{{ $t("pagination.of") }}</span>
    <span data-cy="pager-last-page">{{ lastPageLabel }}</span>
    <BaseTooltip v-if="isCapped" position="top-end" :tooltip-offset="8">
      <template #activator="{ on, describedBy }">
        <span
          v-on="on"
          :aria-describedby="describedBy"
          class="flex items-center text-text-light"
        >
          <Unicon :name="Unicons.QuestionCircle.name" height="14" />
        </span>
      </template>
      <span>{{ $t("pagination.capped-pages-tooltip") }}</span>
    </BaseTooltip>
    <button
      type="button"
      data-cy="pager-next"
      :class="buttonClasses"
      :aria-label="$t('pagination.next')"
      :disabled="currentPage >= lastPage"
      @click="paginationStore.next()"
    >
      <unicon :name="Unicons.AngleRight.name" height="16" />
    </button>
    <button
      type="button"
      data-cy="pager-last"
      :class="buttonClasses"
      :aria-label="$t('pagination.last')"
      :disabled="currentPage >= lastPage"
      @click="paginationStore.goToPage(lastPage)"
    >
      <unicon :name="Unicons.AngleDoubleRight.name" height="16" />
    </button>
  </nav>
</template>

<script lang="ts" setup>
import {
  PaginationStoreKey,
  type PaginationStore,
} from "@/components/library/usePaginationStore";
import { Unicons } from "@/types";
import { computed, inject, ref, watch } from "vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";

const paginationStore = inject(PaginationStoreKey) as PaginationStore;

const buttonClasses =
  "inline-flex items-center justify-center size-(--pager-button-size) rounded-input cursor-pointer hover:bg-surface-row-hover disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";

const currentPage = computed(() => paginationStore.currentPage.value);
const isCapped = computed(() => paginationStore.countIsCapped.value);
// totalPages is reactive; getLastPage() is a plain function.
const lastPage = computed(() => Math.max(paginationStore.totalPages.value, 1));
const lastPageLabel = computed(
  () => `${lastPage.value}${isCapped.value ? "+" : ""}`,
);

const localPage = ref<number | string>(currentPage.value);
watch(currentPage, (page) => (localPage.value = page));

const updatePage = () => {
  paginationStore.goToPage(Number(localPage.value));
  // An out-of-range number is ignored; show the real page again.
  localPage.value = currentPage.value;
};
</script>
