<template>
  <div
    class="flex flex-row items-center justify-center bg-neutral-light p-2 gap-2 w-250 h-120 rounded-lg"
  >
    <unicon :name="Unicons.BookOpen.name" height="18" />
    <span v-if="showVisitedPages"></span>
    <div class="relative flex-1">
      <select
        v-if="showVisitedPages"
        v-model="selectedVisitedPage"
        @change="onVisitedPageChange($event.target.value)"
        class="w-full py-2 px-4 rounded border-0 text-gray-700 font-medium text-center appearance-none bg-transparent"
      >
        <option
          v-for="page in visitedPagesOptions"
          :key="page.value"
          :value="page.value"
          class="text-gray-700"
        >
          {{ page.label }}
        </option>
      </select>
    </div>
  </div>
  <span v-if="showEntityTitle" class="mx-2 text-gray-400">&gt;</span>
  <span v-if="showEntityTitle" class="text-gray-700">{{ entityTitle }}</span>
</template>

<script lang="ts" setup>
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Unicons, DamsIcons } from "@/types";

const {
  visitedPagesOptions,
  selectedVisitedPage,
  showVisitedPages,
  entityTitle,
  showEntityTitle,
  onVisitedPageChange,
} = useBreadcrumb();
</script>
