<template>
  <div class="flex flex-row items-center justify-center bg-neutral-light p-2 gap-2 w-250 h-120 rounded-lg relative">
    <span class="text-gray-700">
      <i class="fas fa-home"></i>
    </span>
    <div>
      <button @click="isOpen = !isOpen"
        class="pr-2.5 py-2 text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer">
        {{ entityTitle || "Home" }}
        <svg v-if="isOpen" class="w-3 h-0">
        </svg>
      </button>
      <ul v-show="isOpen" class="dropdown-menu pr-4 pb-4 bg-neutral-light rounded-lg w-full absolute top-10 left-0">
        <li v-for="page in visitedPagesOptions" :key="page.value" @click="onVisitedPageChange(page.value)"
          class="text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer">
          <unicon v-if="page.label != entityTitle" :name="Unicons.AngleUp.name" />
          <div v-if="page.label != entityTitle">
            <unicon v-if="icon" :name="Unicons[icon].name" />
            {{ page.label }}
          </div>
        </li>
      </ul>
    </div>
  </div>
  <span v-if="showEntityTitle" class="mx-2 mt-1 text-gray-400">
    <unicon :name="Unicons.AngleRight.name" />
  </span>
  <span v-if="showEntityTitle" class="text-gray-700 font-bold">{{ entityTitle }}</span>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Unicons, DamsIcons } from "@/types";

const props = defineProps<{
  icon: DamsIcons;
}>();

const {
  visitedPagesOptions,
  showVisitedPages,
  entityTitle,
  showEntityTitle,
  onVisitedPageChange,
} = useBreadcrumb();

const isOpen = ref(false);
</script>

<style scoped lang="css">.dropdown-menu {
  @apply absolute z-0;
}</style>