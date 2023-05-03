<template>
  <div class="flex flex-row items-center justify-center bg-neutral-light p-2 gap-2 w-250 h-120 rounded-lg relative">
    <span class="text-gray-700">
      <i class="fas fa-home"></i>
    </span>
    <button @click="isOpen = !isOpen" class="py-2 text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer">
      <div v-if="visitedPagesOptions.length > 0">
        <div v-if="visitedPagesOptions.length > 0">
          <div v-if="visitedPagesOptions[0].label === 'Home'" class="flex items-center">
            <unicon :name="Unicons.BookOpen.name" class="w-6 h-6 mr-2" />
          </div>
          <div v-else-if="visitedPagesOptions[0].label === 'Mediafiles'" class="flex items-center">
            <unicon :name="Unicons.Image.name" class="w-6 h-6 mr-2" />
          </div>
          <div v-else-if="visitedPagesOptions[0].label === 'History'" class="flex items-center">
            <unicon :name="Unicons.History.name" class="w-6 h-6 mr-2" />
          </div>
          <div v-else>
            {{ entityTitle }}
          </div>
        </div>
      </div>
      <svg v-if="isOpen" class="w-3 h-0"></svg>
    </button>
    <ul v-show="isOpen" class="dropdown-menu pr-4 pb-4 bg-neutral-light rounded-lg w-full absolute top-10 left-0">
      <li v-for="page in visitedPagesOptions" :key="page.value" @click="onVisitedPageChange(page.value)"
        class="text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer">
        <unicon v-if="page.label != entityTitle" :name="Unicons.AngleUp.name" />
        <div v-if="page.label != entityTitle">
          {{ page.label }}
        </div>
      </li>
    </ul>
  </div>
  <span v-if="showEntityTitle" class="mx-2 mt-1 text-gray-400">
    <unicon :name="Unicons.AngleRight.name" />
  </span>
  <span class="text-gray-700 font-bold">
    <div>
      {{ entityTitle }}
    </div>
  </span>
</template>

<script lang="ts" setup>
import { defineProps, reactive, ref } from "vue";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Unicons, DamsIcons } from "@/types";

const props = defineProps<{
  icon: DamsIcons;
}>();

const {
  visitedPagesOptions,
  entityTitle,
  showEntityTitle,
  onVisitedPageChange,
} = useBreadcrumb();

const isOpen = ref(false);
</script>

<style scoped lang="css">
.dropdown-menu {
  @apply absolute z-0;
}
</style>