<template>
  <nav
    ref="navigation"
    :class="[
      'navbar fixed left-0 top-0 w-24 h-screen align-center pt-10 bg-neutral-white px-5 pb-16 z-50',
      { 'w-80': isExpanded },
    ]"
    @click="changeExpandedState(true)"
  >
    <div>
      <router-link
        :to="{ name: 'Home' }"
        @click="setSelectedMenuItem(menuItems[0])"
        class="mt-4 text-neutral-700 font-semibold mb-8 text-xl flex justify-center"
      >
        <img src="/logo.svg" alt="Elody logo" class="h-12" />
      </router-link>
      <div
        v-for="menuItem in menuItems"
        :key="menuItem.label"
        @click="changeHoveredItem(menuItem)"
      >
        <Menuitem
          :icon="menuItem.icon"
          :menuitem="menuItem"
          :isExpanded="isExpanded"
          :isBeingHovered="menuItem === hoveredItem"
          @onclick="changeExpandedState(true)"
        />
      </div>
    </div>
    <LogInLogout
      :is-expanded="isExpanded"
      :class="[
        'fixed bg-white pb-8 bottom-0 left-0 pl-4 w-100 w-20 logInOut',
        { 'w-72': isExpanded },
      ]"
    />
  </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/generated-types/queries";
import LogInLogout from "@/components/LogInLogout.vue";
import Menuitem from "@/components/menu/MenuItem.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { ref, watch, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";

const navigation = ref<any>(null);
const isExpanded = ref<boolean>(false);
const hoveredItem = ref<MenuItem | undefined>(undefined);
const { getMenuEntities, menuItems, setSelectedMenuItem } = useMenuHelper();
const { isCenterModalOpened } = useBaseModal();
getMenuEntities();

const changeExpandedState = (newState: boolean) => {
  if (!isCenterModalOpened.value || (isCenterModalOpened.value && newState))
    isExpanded.value = newState;
};

const changeHoveredItem = (item: MenuItem | undefined) => {
  if (hoveredItem.value === item) {
    hoveredItem.value = undefined;
  } else {
    hoveredItem.value = item;
  }
};

watch(
  () => isCenterModalOpened.value,
  () => {
    if (isCenterModalOpened.value) {
      changeExpandedState(true);
    } else {
      changeExpandedState(false);
    }
  }
);

onMounted(() => {
  document.body.addEventListener("click", closeExpanded);
});

onUnmounted(() => {
  document.body.removeEventListener("click", closeExpanded);
});

const closeExpanded = (event: any) => {
  if (!navigation.value) return;

  const isClickedOutsideNavigation =
    navigation.value && !navigation.value.contains(event.target);
  if (isClickedOutsideNavigation && !isCenterModalOpened.value) {
    changeExpandedState(false);
    changeHoveredItem(undefined);
  }
};
</script>

<style>
.navbar,
.logInOut {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}
.navbar:hover .router-link {
  justify-content: flex-start;
}
</style>
