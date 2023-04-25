<template>
  <div class="flex flex-row items-center justify-center bg-neutral-light p-2 gap-2 w-250 h-120 rounded-lg relative">
    <span class="text-gray-700">
      <i class="fas fa-home"></i>
    </span>
    <div v-if="entityTitle === 'Home' || 'MediaFiles' || 'History'">
      <button @click="isOpen = !isOpen"
        class="pr-2.5 py-2 text-sm text-gray-800 text-right hover:bg-gray-100 cursor-pointer">
        <div v-if="entityTitle === 'Home'" class="flex items-center">
          <unicon :name="Unicons.BookOpen.name" class="w-6 h-6 mr-2" />
          <span class="ml-1">{{ entityTitle }}</span>
        </div>
        <div v-else-if="entityTitle === 'Mediafiles'" class="flex items-center">
          <unicon :name="Unicons.Image.name" class="w-6 h-6 mr-2" />
          <span class="ml-1">{{ entityTitle }}</span>
        </div>
        <div v-else-if="entityTitle === 'History'" class="flex items-center">
          <unicon :name="Unicons.History.name" class="w-6 h-6 mr-2" />
          <span class="ml-1">{{ entityTitle }}</span>
        </div>
        <div v-else>
          {{ entityTitle }}
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
    <span v-else class="text-gray-700 font-bold">{{ entityTitle }}</span>
  </div>
  <span v-if="showEntityTitle" class="mx-2 mt-1 text-gray-400">
    <unicon :name="Unicons.AngleRight.name" />
  </span>
  <span v-if="showEntityTitle" class="text-gray-700 font-bold">
    <div v-if="entityTitle === 'Home' || 'MediaFiles' || 'History'">
      <div v-if="entityTitle === 'Home'" class="flex items-center">
        <unicon :name="Unicons.BookOpen.name" class="w-6 h-6 mr-2" />
        <span class="ml-1">{{ entityTitle }}</span>
      </div>
      <div v-else-if="entityTitle === 'Mediafiles'" class="flex items-center">
        <unicon :name="Unicons.Image.name" class="w-6 h-6 mr-2" />
        <span class="ml-1">{{ entityTitle }}</span>
      </div>
      <div v-else-if="entityTitle === 'History'" class="flex items-center">
        <unicon :name="Unicons.History.name" class="w-6 h-6 mr-2" />
        <span class="ml-1">{{ entityTitle }}</span>
      </div>
      <div v-else>
        {{
          entityTitle
        }}
      </div>
    </div>
  </span>
</template>

<script lang="ts" setup>
import { defineProps, reactive, ref } from "vue";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Unicons, DamsIcons } from "@/types";
import {
  GetMenuDocument,
  type GetMenuQuery,
  type GetMenuQueryVariables,
  type MenuItem,
} from "@/generated-types/queries";
import { useQuery } from "@vue/apollo-composable";

const menuItems = ref<Array<MenuItem>>([]);
const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
const { result: menuQueryResult, onResult } = useQuery<GetMenuQuery>(
  GetMenuDocument,
  queryVariables
);
onResult((value) => {
  menuItems.value = Object.values(value.data.Menu?.menu || {}).filter(
    (menu) => menu.typeLink
  );
});

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