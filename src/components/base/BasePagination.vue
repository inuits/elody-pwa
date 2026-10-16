<template>
  <!-- pagination.md: real buttons, current page filled, ‹/› disabled at the edges. -->
  <nav
    :aria-label="$t('pagination.label')"
    class="flex items-center gap-(--pager-gap) text-ui text-text-body select-none"
    @keydown.left.prevent="moveFocus(-1)"
    @keydown.right.prevent="moveFocus(1)"
  >
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
    <template v-for="(item, index) in items" :key="`${item}-${index}`">
      <span v-if="item === '…'" aria-hidden="true" class="px-1 text-text-muted"
        >…</span
      >
      <button
        v-else
        type="button"
        data-cy="pager-page"
        :class="[
          buttonClasses,
          item === currentPage
            ? 'bg-(--pager-current-bg) text-text-on-accent font-bold'
            : '',
        ]"
        :aria-current="item === currentPage ? 'page' : undefined"
        @click="paginationStore.goToPage(item)"
      >
        {{ item }}{{ item === lastPage && isCapped ? "+" : "" }}
      </button>
    </template>
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
  </nav>
</template>

<script lang="ts" setup>
import {
  PaginationStoreKey,
  pageItems,
  type PaginationStore,
} from "@/components/library/usePaginationStore";
import { Unicons } from "@/types";
import { computed, inject } from "vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

const paginationStore = inject(PaginationStoreKey) as PaginationStore;

const buttonClasses =
  "inline-flex items-center justify-center min-w-(--pager-button-size) h-(--pager-button-size) px-1 rounded-input cursor-pointer hover:bg-surface-row-hover disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";

const currentPage = computed(() => paginationStore.currentPage.value);
const isCapped = computed(() => paginationStore.countIsCapped.value);
// totalPages is reactive; getLastPage() is a plain function.
const lastPage = computed(() => Math.max(paginationStore.totalPages.value, 1));
const items = computed(() => pageItems(currentPage.value, lastPage.value));

// ←/→ move focus within the pager group; Enter/Space activate natively.
const moveFocus = (step: number) => {
  const nav = (document.activeElement as HTMLElement | null)?.closest("nav");
  if (!nav) return;
  const buttons = [
    ...nav.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
  ];
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  buttons[index + step]?.focus();
};
</script>
