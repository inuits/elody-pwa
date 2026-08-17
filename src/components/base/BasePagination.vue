<template>
  <nav class="pagination" :aria-label="$t('pagination.nav-label')">
    <label class="pagination__size">
      <span class="pagination__size-label">
        {{ $t("pagination.results-per-page") }}
      </span>
      <select
        class="pagination__size-select"
        :value="paginationStore.limit.value"
        @change="onLimitChange"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ $t("pagination.per-page", { count: size }) }}
        </option>
      </select>
    </label>

    <div class="pagination__pager">
      <button
        type="button"
        class="pagination__step"
        :aria-label="$t('pagination.previous')"
        :disabled="isFirstPage"
        @click="paginationStore.previous()"
      >
        <unicon :name="Unicons.AngleLeft.name" height="16" />
      </button>

      <template v-for="(entry, index) in pageWindow">
        <span v-if="entry === PAGE_GAP" :key="`gap-${index}`" class="pagination__gap" aria-hidden="true">
          …
        </span>
        <button
          v-else
          :key="`page-${entry}`"
          type="button"
          class="pagination__page"
          :class="{ 'pagination__page--current': entry === currentPage }"
          :aria-current="entry === currentPage ? 'page' : undefined"
          @click="paginationStore.goToPage(entry)"
        >
          {{ entry }}
        </button>
      </template>

      <button
        type="button"
        class="pagination__step"
        :aria-label="$t('pagination.next')"
        :disabled="isLastPage"
        @click="paginationStore.next()"
      >
        <unicon :name="Unicons.AngleRight.name" height="16" />
      </button>

      <BaseTooltip
        v-if="paginationStore.countIsCapped.value"
        position="top-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div v-on="on" class="flex items-center">
            <Unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <span>{{ $t("pagination.capped-pages-tooltip") }}</span>
      </BaseTooltip>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import {
  PaginationStoreKey,
  type PaginationStore,
} from "@/components/library/usePaginationStore";
import { Unicons } from "@/types";
import { computed, inject } from "vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { getPageWindow, PAGE_GAP } from "@/components/base/pageWindow";

const paginationStore = inject(PaginationStoreKey) as PaginationStore;

const pageSizes = [10, 20, 25, 50, 100];

const currentPage = computed<number>(() => paginationStore.currentPage.value);
const lastPage = computed<number>(() => paginationStore.getLastPage());

const pageWindow = computed(() =>
  getPageWindow(currentPage.value, lastPage.value),
);

const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= lastPage.value);

const onLimitChange = (event: Event) => {
  // Changing the size returns to page 1; the store already does that.
  paginationStore.setLimit(Number((event.target as HTMLSelectElement).value));
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-ds-8);
  font-size: var(--text-ui);
  color: var(--color-text-body);
  user-select: none;
}

.pagination__size {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-5);
}

/* The select carries its own name; the visible text is the label. */
.pagination__size-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.pagination__size-select {
  padding: var(--spacing-ds-2) var(--spacing-ds-5);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-input);
  background-color: var(--color-surface);
  font-size: var(--text-ui);
  color: var(--color-text-body);
}

.pagination__size-select:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.pagination__pager {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-2);
}

.pagination__page,
.pagination__step {
  min-width: 26px;
  padding: var(--spacing-ds-2) var(--spacing-ds-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-input);
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.pagination__page:hover:not(.pagination__page--current),
.pagination__step:not(:disabled):hover {
  background-color: var(--color-surface-editable-hover);
}

.pagination__page:focus-visible,
.pagination__step:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.pagination__page--current {
  background-color: var(--color-accent);
  color: var(--color-text-on-accent);
  font-weight: 700;
}

.pagination__step:disabled {
  color: var(--color-text-subtle);
  cursor: default;
}

.pagination__gap {
  padding: 0 var(--spacing-ds-2);
  color: var(--color-text-subtle);
}
</style>
