<template>
  <nav
    data-cy="menu-nav"
    ref="navigation"
    :class="[
      'navbar fixed left-0 top-0 w-[52px] h-screen align-center pt-6 bg-background-light px-1.5 pb-16 z-navigation',
      { '!w-80 !px-5': isExpanded },
    ]"
    :aria-label="navAriaLabel"
    @click.self="changeExpandedStateOfMenu(true)"
  >
    <div>
      <router-link
        :to="{ path: '/' }"
        @click="setSelectedMenuItem(menuItems[0])"
        class="mt-4 text-neutral-700 font-semibold mb-8 text-xl flex justify-center"
      >
        <img src="/logo.svg" alt="Elody logo" :class="isExpanded ? 'h-12' : 'h-8'" />
      </router-link>
      <div
        v-if="environmentLabel"
        data-cy="environment-pill"
        class="mb-8 -mt-6 flex justify-center"
      >
        <span
          class="rounded-pill bg-accent text-neutral-white text-micro font-bold px-1.5 py-0.5"
        >
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
import { computed, ref, onMounted, onUnmounted, inject } from "vue";
import { useI18n } from "vue-i18n";
import { getEnvironmentLabel } from "@/helpers";
import { RouterLink } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useRouter } from "vue-router";

const { t, te } = useI18n();
const navAriaLabel = computed<string>(() =>
  te("navigation.main") ? t("navigation.main") : "Main navigation",
);
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
    navigation.value &&
    !navigation.value.innerHTML.includes(event.target.innerHTML);
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
.navbar,
.logInOut {
  transition-property: width, padding;
  transition-timing-function: var(--ease-ui, ease);
  transition-duration: var(--transition-duration-ui, 0.13s);
  overflow-x: hidden;
}
.navbar:hover .router-link {
  justify-content: flex-start;
}
</style>
