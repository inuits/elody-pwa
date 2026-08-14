<template>
  <!-- Design-system pager: ‹ · numbered pages (ellipsis for gaps) · ›.
       Real buttons, current page accent-filled, arrows move focus. -->
  <nav
    :aria-label="paginationLabel"
    class="flex items-center gap-1 select-none text-ui text-text-body"
    @keydown.left.prevent="moveFocus(-1)"
    @keydown.right.prevent="moveFocus(1)"
  >
    <button
      type="button"
      data-cy="pagination-previous"
      :aria-label="$t('pagination.page') + ' -1'"
      class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-input border-none bg-transparent hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent disabled:cursor-not-allowed disabled:opacity-45"
      :disabled="currentPage <= 1"
      @click="paginationStore.previous()"
    >
      <unicon :name="Unicons.AngleLeft.name" height="16" />
    </button>

    <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
      <span v-if="page === ELLIPSIS" class="px-1 text-text-subtle">…</span>
      <button
        v-else
        type="button"
        class="h-6 min-w-6 cursor-pointer rounded-input border-none px-1 font-bold tabular-nums focus-visible:outline-2 focus-visible:outline-accent-accent"
        :class="
          page === currentPage
            ? 'bg-accent text-neutral-white'
            : 'bg-transparent text-text-body hover:bg-accent-wash'
        "
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="paginationStore.goToPage(page)"
      >
        {{ page }}
      </button>
    </template>

    <BaseTooltip
      v-if="paginationStore.countIsCapped.value"
      position="top-end"
      :tooltip-offset="8"
    >
      <template #activator="{ on }">
        <span v-on="on" class="flex items-center">
          <Unicon :name="Unicons.QuestionCircle.name" height="16" />
        </span>
      </template>
      <span class="text-sm text-text-placeholder">
        {{ $t("pagination.capped-pages-tooltip") }}
      </span>
    </BaseTooltip>

    <button
      type="button"
      data-cy="pagination-next"
      :aria-label="$t('pagination.page') + ' +1'"
      class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-input border-none bg-transparent hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent disabled:cursor-not-allowed disabled:opacity-45"
      :disabled="currentPage >= lastPage"
      @click="paginationStore.next()"
    >
      <unicon :name="Unicons.AngleRight.name" height="16" />
    </button>
  </nav>
</template>

<script lang="ts" setup>
import {
  PaginationStoreKey,
  type PaginationStore,
} from "@/components/library/usePaginationStore";
import { Unicons } from "@/types";
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

const ELLIPSIS = "…" as const;

const paginationStore = inject(PaginationStoreKey) as PaginationStore;
const { t, te } = useI18n();

const paginationLabel = computed<string>(() =>
  te("pagination.label") ? t("pagination.label") : "Pagination",
);

const currentPage = computed<number>(() => paginationStore.currentPage.value);
const lastPage = computed<number>(() => paginationStore.getLastPage());

// 1 … current−1 current current+1 … last, deduplicated and in order.
const visiblePages = computed<(number | typeof ELLIPSIS)[]>(() => {
  const pages = new Set<number>([1, lastPage.value]);
  for (let page = currentPage.value - 1; page <= currentPage.value + 1; page++)
    if (page >= 1 && page <= lastPage.value) pages.add(page);
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | typeof ELLIPSIS)[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push(ELLIPSIS);
    result.push(page);
  });
  return result;
});

// ←/→ move focus between the pager's buttons.
const moveFocus = (delta: number) => {
  const nav = document.activeElement?.closest("nav");
  if (!nav) return;
  const buttons = Array.from(
    nav.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
  );
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;
  buttons[(index + delta + buttons.length) % buttons.length]?.focus();
};
</script>
