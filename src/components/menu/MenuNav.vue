<template>
  <nav
    :class="[
      'navbar fixed left-0 top-0 w-24 h-screen align-center pt-10 bg-neutral-white px-5 z-50',
      { 'w-80': isExpanded },
    ]"
    @click="changeExpandedState(true)"
    @mouseleave="changeExpandedState(false)"
  >
    <router-link
      :to="{ name: 'Home' }"
      @click="setSelectedMenuItem(menuItems[0])"
      class="logo mt-4 text-neutral-700 font-semibold mb-8 text-xl"
    >
      <img src="/logo.svg" alt="Elody logo" class="h-12" />
    </router-link>
    <div
      v-for="menuItem in menuItems"
      :key="menuItem.label"
      @mouseenter="changeHoveredItem(menuItem)"
      @mouseleave="changeHoveredItem(undefined)"
    >
      <Menuitem
        :icon="menuItem.icon"
        :menuitem="menuItem"
        :isExpanded="isExpanded"
        :isBeingHovered="menuItem === hoveredItem"
        @onclick="changeExpandedState(true)"
      />
    </div>
    <LogInLogout :is-expanded="isExpanded" class="mt-5 ml-3" />
  </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/generated-types/queries";
import LogInLogout from "@/components/LogInLogout.vue";
import Menuitem from "@/components/menu/MenuItem.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";

const isExpanded = ref<boolean>(false);
const hoveredItem = ref<MenuItem | undefined>(undefined);
const { getMenuEntities, menuItems, setSelectedMenuItem } = useMenuHelper();
const { isLeftModalOpened } = useBaseModal();
getMenuEntities();

const changeExpandedState = (newState: boolean) => {
  if (!isLeftModalOpened.value || (isLeftModalOpened.value && newState))
    isExpanded.value = newState;
};

const changeHoveredItem = (item: MenuItem | undefined) => {
  hoveredItem.value = item;
};

watch(
  () => isLeftModalOpened.value,
  () => {
    if (isLeftModalOpened.value) {
      changeExpandedState(true);
    } else {
      changeExpandedState(false);
    }
  }
);
</script>

<style>
.navbar {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}
.navbar:hover .router-link {
  justify-content: flex-start;
}
</style>
