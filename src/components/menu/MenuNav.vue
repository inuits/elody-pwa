<template>
  <nav
    data-cy="menu-nav"
    ref="navigation"
    :aria-label="$t('navigation.main')"
    :class="[
      'navbar fixed left-0 top-0 h-screen flex flex-col bg-surface z-navigation',
      // navigation.md: 52px rail; expanded, a flyout over the content
      isExpanded
        ? 'w-(--nav-flyout-width) shadow-overlay'
        : 'w-(--nav-rail-width)',
    ]"
    @click.self="changeExpandedStateOfMenu(true)"
  >
    <div
      class="shrink-0 flex flex-col items-center gap-1 p-(--nav-rail-pad)"
    >
      <router-link
        :to="{ path: '/' }"
        @click="setSelectedMenuItem(menuItems[0])"
        class="flex justify-center"
      >
        <img src="/logo.svg" alt="Elody logo" class="w-(--nav-rail-logo) h-auto" />
      </router-link>
      <div v-if="environmentLabel" data-cy="environment-pill" class="flex">
        <!-- small enough for the 52px rail -->
        <span
          class="rounded-chip bg-surface-muted text-text-secondary text-hint font-semibold px-1 uppercase"
        >
          {{ environmentLabel }}
        </span>
      </div>
    </div>
    <div
      data-cy="menu-nav-items"
      :class="[
        'navbar-items flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-(--nav-rail-gap) pb-4',
        isExpanded ? 'px-3' : 'items-center',
      ]"
      @click.self="changeExpandedStateOfMenu(true)"
    >
      <div
        v-for="menuItem in menuItems"
        :key="menuItem.label"
        @click.capture="
          changeHoveredItem(menuItem);
          changeExpandedStateOfMenu(true);
        "
      >
        <Menuitem
          :icon="menuItem.icon"
          :menuitem="menuItem"
          :isExpanded="isExpanded"
          :isBeingHovered="menuItem === hoveredItem"
          @onclick="changeExpandedStateOfMenu(true)"
        />
      </div>
    </div>
    <LogInLogout
      :is-expanded="isExpanded"
      :class="['shrink-0 pt-4 pb-(--nav-rail-gap)', { 'px-3': isExpanded }]"
    />
  </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/generated-types/queries";
import LogInLogout from "@/components/LogInLogout.vue";
import Menuitem from "@/components/menu/MenuItem.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { ref, onMounted, onUnmounted, inject, watch } from "vue";
import { getEnvironmentLabel } from "@/helpers";
import { useBaseModal } from "@/composables/useBaseModal";
import { useRouter } from "vue-router";
import { useMenuBadges } from "@/composables/useMenuBadges";

const config: any = inject("config");
const environmentLabel = getEnvironmentLabel(config?.DEPLOYMENT_ENVIRONMENT);

const navigation = ref<any>(null);
const hoveredItem = ref<MenuItem | undefined>(undefined);
const router = useRouter();
const {
  getMenuEntities,
  menuItems,
  setSelectedMenuItem,
  changeExpandedState,
  isExpanded,
} = useMenuHelper();
const { someModalIsOpened } = useBaseModal();
getMenuEntities();

const { refreshBadges } = useMenuBadges();
watch(menuItems, () => refreshBadges(menuItems.value));

const changeExpandedStateOfMenu = (newState: boolean) => {
  if (!someModalIsOpened.value || (someModalIsOpened.value && newState))
    changeExpandedState(newState);
};

const changeHoveredItem = (item: MenuItem | undefined) => {
  if (hoveredItem.value === item) {
    hoveredItem.value = undefined;
  } else {
    hoveredItem.value = item;
  }
};

// navigation.md Round 2: Escape closes the expanded menu
const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isExpanded.value)
    changeExpandedStateOfMenu(false);
};

onMounted(() => {
  document.body.addEventListener("click", closeExpanded);
  document.addEventListener("keydown", closeOnEscape);
});

onUnmounted(() => {
  document.body.removeEventListener("click", closeExpanded);
  document.removeEventListener("keydown", closeOnEscape);
});

const closeExpanded = (event: any) => {
  if (!navigation.value) return;

  const isClickedOutsideNavigation =
    navigation.value &&
    !navigation.value.innerHTML.includes(event.target.innerHTML);
  if (isClickedOutsideNavigation && !someModalIsOpened.value) {
    changeExpandedStateOfMenu(false);
    changeHoveredItem(undefined);
  }
};

router.afterEach(() => {
  changeExpandedStateOfMenu(false);
  refreshBadges(menuItems.value);
});
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
.navbar-items {
  scrollbar-width: thin;
  scrollbar-color: var(--color-neutral-40) transparent;
}
.navbar-items::-webkit-scrollbar {
  width: 4px;
}
.navbar-items::-webkit-scrollbar-track {
  background: transparent;
}
.navbar-items::-webkit-scrollbar-thumb {
  background-color: var(--color-neutral-40);
  border-radius: 9999px;
}
</style>
