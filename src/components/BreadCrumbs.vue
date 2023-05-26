<template>
  <div
    class="flex flex-row items-center justify-center bg-neutral-light pt-1.5 px-3.5 min-w-12 h-12 rounded-2xl relative"
  >
    <span class="text-gray-700">
      <i class="fas fa-home"></i>
    </span>
    <button
      @click="isOpen = !isOpen"
      class="py-2 text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer"
    >
      <div v-if="menuItems.length && visitedPagesOptions.length > 0">
        <div
          v-if="
            visitedPagesOptions[0]?.label ===
            menuItems[0].typeLink?.route?.destination
          "
        >
          <unicon
            v-if="Unicons[menuItems[0].icon]"
            :name="Unicons[menuItems[0].icon].name"
            class="w-5 h-5"
          />
          <CustomIcon
            v-else-if="menuItems[0].icon"
            :icon="menuItems[0].icon"
            :size="24"
            color="text-body"
            class="mr-2"
          />
        </div>
      </div>
      <div v-else>
        {{ entityTitle }}
      </div>
      <svg v-if="isOpen" class="w-3 h-0"></svg>
    </button>
    <ul
      v-show="isOpen"
      class="dropdown-menu pr-4 pb-4 bg-neutral-light rounded-lg w-full absolute top-10 left-0"
    >
      <li
        v-for="page in visitedPagesOptions"
        :key="page.value"
        @click="onVisitedPageChange(page.value)"
        class="text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer"
      >
        <unicon v-if="page.label != entityTitle" :name="Unicons.AngleUp.name" />
        <div v-if="page.label != entityTitle">
          {{ page.label }}
        </div>
      </li>
    </ul>
  </div>
  <span class="mx-2 mt-1 text-gray-400">
    <unicon :name="Unicons.AngleRight.name" />
  </span>
  <span class="font-serif text-lg leading-8 text-gray-800 font-bold">
    <div v-if="menuItems.length && entityTitle === ''">
      <div
        v-if="
          visitedPagesOptions[0]?.label ===
          menuItems[0].typeLink?.route?.destination
        "
      >
        {{ menuItems[0].typeLink.route.destination }}
      </div>
    </div>
    <div v-else>
      {{ entityTitle }}
    </div>
  </span>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Unicons } from "@/types";
import useMenuHelper from "@/composables/useMenuHelper";
import CustomIcon from "./CustomIcon.vue";

const { visitedPagesOptions, entityTitle, onVisitedPageChange } =
  useBreadcrumb();

const { getMenuEntities, menuItems } = useMenuHelper();
getMenuEntities();
const isOpen = ref(false);
</script>

<style scoped lang="postcss">
.dropdown-menu {
  @apply absolute z-0;
}
</style>
