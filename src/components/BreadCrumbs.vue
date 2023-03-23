<template>
  <div class="flex items-center text-sm">
    <span v-if="showVisitedPages"></span>
    <select
      v-if="showVisitedPages"
      v-model="selectedVisitedPage"
      @change="onVisitedPageChange($event.target.value)"
      class="py-2 px-4 rounded border-gray-300 text-gray-700 font-medium ml-2"
    >
      <option
        v-for="page in visitedPagesOptions"
        v-bind:key="page.value"
        :value="page.value"
      >
        {{ page.label }}
      </option>
    </select>
    <span v-if="showEntityTitle" class="mx-2 text-gray-400"> > </span>
    <span v-if="showEntityTitle" class="text-gray-700">{{ entityTitle }}</span>
  </div>
</template>

<script lang="ts" setup>
import { useBreadcrumb } from "@/composables/useBreadcrumb";

const {
  visitedPagesOptions,
  selectedVisitedPage,
  showVisitedPages,
  entityTitle,
  showEntityTitle,
  onVisitedPageChange,
} = useBreadcrumb();
</script>
