<template>
  <div
    v-if="isCompact && isDrawerOpen"
    data-cy="nav-drawer-backdrop"
    class="fixed inset-0 z-navigation bg-scrim"
    @click="closeDrawer"
  />
  <nav
    id="main-navigation"
    ref="navRef"
    data-cy="menu-nav"
    :aria-label="t('navigation.main')"
    :inert="(isCompact && !isDrawerOpen) || undefined"
    class="fixed left-0 top-0 h-screen max-md:h-dvh flex flex-col overflow-x-hidden bg-surface border-r border-border-subtle duration-(--transition-duration-ui) ease-(--ease-ui) motion-reduce:transition-none"
    :class="navClasses"
    @focusout="onFocusOut"
  >
    <div
      :class="[
        'shrink-0 flex items-center gap-(--nav-rail-gap) p-(--nav-rail-pad)',
        expanded ? 'justify-between px-3' : 'flex-col',
      ]"
    >
      <div :class="['flex items-center gap-1', { 'flex-col': !expanded }]">
        <RouterLink to="/" class="flex justify-center">
          <img
            src="/logo.svg"
            :alt="t('navigation.go-home')"
            class="w-(--nav-rail-logo) h-auto"
          />
        </RouterLink>
        <span
          v-if="environmentLabel"
          data-cy="environment-pill"
          class="rounded-chip bg-surface-muted text-text-secondary text-hint font-semibold px-1 uppercase"
        >
          {{ environmentLabel }}
        </span>
      </div>
      <button
        v-if="isCompact"
        ref="closeButtonRef"
        type="button"
        data-cy="nav-drawer-close"
        :aria-label="t('navigation.close-menu')"
        class="flex items-center justify-center size-(--touch-target-min) rounded-(--nav-rail-item-radius) text-text-muted cursor-pointer hover:bg-accent-highlight"
        @click="closeDrawer"
      >
        <unicon name="times" height="22" aria-hidden="true" />
      </button>
      <BaseTooltip v-else position="right" :tooltip-offset="24" :show-delay="0">
        <template #activator="{ on }">
          <button
            v-on="on"
            type="button"
            data-cy="nav-mode-toggle"
            :aria-label="modeToggle.label"
            class="flex items-center justify-center w-(--nav-rail-item-width) h-(--nav-rail-item-height) rounded-(--nav-rail-item-radius) text-text-muted hover:bg-accent-highlight"
            @click="switchMode"
          >
            <unicon :name="modeToggle.icon" height="18" aria-hidden="true" />
          </button>
        </template>
        <template #default>{{ modeToggle.label }}</template>
      </BaseTooltip>
    </div>
    <ul
      data-cy="menu-nav-items"
      :class="[
        'nav-rail-items flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-(--nav-rail-gap) pb-4',
        expanded ? 'px-3' : 'items-center',
      ]"
    >
      <NavItem
        v-for="item in visibleItems"
        :key="item.label"
        :item="item"
        :expanded="expanded"
        :open="isGroupOpen(item)"
        @toggle="toggleGroup(item)"
        @close="closeFlyout"
      />
    </ul>
    <div
      v-if="isCompact"
      class="shrink-0 grid grid-cols-2 gap-2 px-3 pt-3 border-t border-border-subtle"
    >
      <LanguageSelect />
      <TenantSwitcher v-if="config?.features?.hasTenantSelect" />
    </div>
    <LogInLogout
      :is-expanded="expanded"
      :class="['shrink-0 pt-4 pb-(--nav-rail-gap)', { 'px-3': expanded }]"
    />
  </nav>
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { MenuItem } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
import { useMenuBadges } from "@/composables/useMenuBadges";
import { NavMode, useNavMenu } from "@/composables/useNavMenu";
import { getEnvironmentLabel } from "@/helpers";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import LogInLogout from "@/components/LogInLogout.vue";
import TenantSwitcher from "@/components/menu/TenantSwitcher.vue";
import NavItem from "@/components/navigation/NavItem.vue";

const config = inject<{
  DEPLOYMENT_ENVIRONMENT?: string;
  features?: { hasTenantSelect?: boolean };
}>("config");
const environmentLabel = getEnvironmentLabel(config?.DEPLOYMENT_ENVIRONMENT);

const { t } = useI18n();
const router = useRouter();
const navRef = useTemplateRef<HTMLElement>("navRef");
const closeButtonRef = useTemplateRef<HTMLElement>("closeButtonRef");
const { getMenuEntities, menuItems } = useMenuHelper();
const { isOpen, setMode, isVisible, isCompact, isDrawerOpen, closeDrawer } =
  useNavMenu();
const { refreshBadges } = useMenuBadges();

getMenuEntities();
watch(menuItems, (items) => refreshBadges(items));

const openGroup = ref<string>();
const flyoutGroup = ref<string>();

const expanded = computed(() => isOpen.value || isCompact.value);
const visibleItems = computed(() => menuItems.value.filter(isVisible));
const navClasses = computed(() => {
  const styles = {
    drawer: [
      "w-(--nav-drawer-width) max-w-full z-navigation transition-transform",
      isDrawerOpen.value ? "shadow-overlay" : "-translate-x-full",
    ],
    rail: [
      "transition-[width]",
      isOpen.value ? "w-(--nav-flyout-width)" : "w-(--nav-rail-width)",
      flyoutGroup.value ? "z-context-menu" : "z-navigation",
    ],
  };
  return isCompact.value ? styles.drawer : styles.rail;
});
const modeToggle = computed(() =>
  isOpen.value
    ? { icon: "left-indent-alt", label: t("navigation.menu-mode.collapse") }
    : { icon: "right-indent-alt", label: t("navigation.menu-mode.expand") },
);

const isGroupOpen = (item: MenuItem) =>
  (expanded.value ? openGroup.value : flyoutGroup.value) === item.label;

const toggleGroup = (item: MenuItem) => {
  const group = expanded.value ? openGroup : flyoutGroup;
  group.value = group.value === item.label ? undefined : item.label;
};

const flyoutItem = () =>
  navRef.value?.querySelector<HTMLElement>("[data-flyout-open]");

const closeFlyout = () => {
  flyoutGroup.value = undefined;
};

const switchMode = () => {
  closeFlyout();
  setMode(isOpen.value ? NavMode.Collapsed : NavMode.Expanded);
};

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  if (isCompact.value && isDrawerOpen.value) return closeDrawer();
  if (!flyoutGroup.value) return;
  const focused = document.activeElement;
  if (focused && focused !== document.body && !navRef.value?.contains(focused))
    return;
  flyoutItem()?.querySelector<HTMLElement>("[aria-expanded]")?.focus();
  closeFlyout();
};

const closeFlyoutOnOutsidePointer = (event: PointerEvent) => {
  if (flyoutGroup.value && !flyoutItem()?.contains(event.target as Node))
    closeFlyout();
};

const onFocusOut = (event: FocusEvent) => {
  const target = event.relatedTarget as Node | null;
  if (flyoutGroup.value && target && !flyoutItem()?.contains(target))
    closeFlyout();
};

watch(isDrawerOpen, async (open) => {
  if (!open) return;
  await nextTick();
  closeButtonRef.value?.focus();
});

const removeAfterEach = router.afterEach(() => {
  closeFlyout();
  closeDrawer();
  refreshBadges(menuItems.value);
});

onMounted(() => {
  document.addEventListener("keydown", closeOnEscape);
  document.addEventListener("pointerdown", closeFlyoutOnOutsidePointer);
});

onUnmounted(() => {
  removeAfterEach();
  document.removeEventListener("keydown", closeOnEscape);
  document.removeEventListener("pointerdown", closeFlyoutOnOutsidePointer);
});
</script>

<style scoped>
.nav-rail-items {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-default) transparent;
}
</style>
