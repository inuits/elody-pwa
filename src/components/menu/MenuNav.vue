<template>
  <nav
    data-cy="menu-nav"
    ref="navigation"
    :aria-label="$t('navigation.main-label')"
    @keydown.escape="changeExpandedStateOfMenu(false)"
    :class="[
      'navbar fixed left-0 top-0 w-24 h-screen align-center pt-10 bg-background-light px-5 pb-16 z-navigation',
      { 'w-80 navbar--expanded': isExpanded },
    ]"
    @click.self="changeExpandedStateOfMenu(true)"
  >
    <div>
      <router-link
        :to="{ path: '/' }"
        @click="setSelectedMenuItem(menuItems[0])"
        class="mt-4 text-neutral-700 font-semibold mb-8 text-xl flex justify-center"
      >
        <img src="/logo.svg" alt="Elody logo" class="h-12" />
      </router-link>
      <div
        v-if="environmentLabel"
        data-cy="environment-pill"
        class="mb-8 -mt-6 flex justify-center"
      >
        <span class="environment-pill">
          {{ environmentLabel }}
        </span>
      </div>
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
      :class="['fixed bg-white pb-8 bottom-0 left-0 pl-4']"
    />
  </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/generated-types/queries";
import LogInLogout from "@/components/LogInLogout.vue";
import Menuitem from "@/components/menu/MenuItem.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { ref, onMounted, onUnmounted, inject } from "vue";
import { getEnvironmentLabel } from "@/helpers";
import { RouterLink } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useRouter } from "vue-router";

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
  if (isClickedOutsideNavigation && !someModalIsOpened.value) {
    changeExpandedStateOfMenu(false);
    changeHoveredItem(undefined);
  }
};

router.afterEach(() => {
  changeExpandedStateOfMenu(false);
});
</script>

<style>
/* The flyout floats over content, so it carries the overlay shadow; the
   collapsed rail sits in the layout and floats nothing (navigation.md). */
.navbar--expanded {
  box-shadow: var(--shadow-overlay);
}

/* Not production: the warning pair, legible on every tenant — the mint with
   white text failed contrast everywhere. */
.environment-pill {
  padding: 0 var(--spacing-ds-5);
  border-radius: var(--radius-pill);
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: var(--text-micro);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

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
