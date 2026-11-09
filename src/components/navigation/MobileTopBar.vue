<template>
  <div
    data-cy="mobile-top-bar"
    class="shrink-0 flex items-center gap-2 h-(--mobile-top-bar-height) pl-1.5 pr-3 bg-surface border-b border-border-subtle"
  >
    <button
      ref="menuButtonRef"
      type="button"
      data-cy="nav-drawer-open"
      aria-controls="main-navigation"
      :aria-expanded="isDrawerOpen"
      :aria-label="t('navigation.open-menu')"
      class="relative flex items-center justify-center size-(--touch-target-min) rounded-(--nav-rail-item-radius) text-text-muted cursor-pointer hover:bg-accent-highlight"
      @click="openDrawer"
    >
      <unicon name="bars" height="24" aria-hidden="true" />
      <span
        v-if="hasBadges"
        data-test="menu-badge-dot"
        aria-hidden="true"
        class="absolute top-2 right-2 size-2 rounded-full bg-accent ring-2 ring-surface"
      />
    </button>
    <RouterLink to="/" class="flex">
      <img
        src="/logo.svg"
        :alt="t('navigation.go-home')"
        class="w-(--nav-rail-logo) h-auto"
      />
    </RouterLink>
    <span
      v-if="environmentLabel"
      class="rounded-chip bg-surface-muted text-text-secondary text-hint font-semibold px-1 uppercase"
    >
      {{ environmentLabel }}
    </span>
    <SearchBar
      v-if="config?.features?.simpleSearch"
      class="ml-auto"
      :input-enabled="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import useMenuHelper from "@/composables/useMenuHelper";
import { useMenuBadges } from "@/composables/useMenuBadges";
import { useNavMenu } from "@/composables/useNavMenu";
import { getEnvironmentLabel } from "@/helpers";
import SearchBar from "@/components/SearchBar.vue";

const config = inject<{
  DEPLOYMENT_ENVIRONMENT?: string;
  features?: { simpleSearch?: unknown };
}>("config");
const environmentLabel = getEnvironmentLabel(config?.DEPLOYMENT_ENVIRONMENT);

const { t } = useI18n();
const { menuItems } = useMenuHelper();
const { totalBadgeCountOf } = useMenuBadges();
const { isDrawerOpen, openDrawer, isVisible } = useNavMenu();
const menuButtonRef = useTemplateRef<HTMLElement>("menuButtonRef");

const hasBadges = computed(() =>
  menuItems.value.some(
    (item) => isVisible(item) && totalBadgeCountOf(item) > 0,
  ),
);

watch(
  isDrawerOpen,
  (open) => {
    if (!open) menuButtonRef.value?.focus();
  },
  { flush: "post" },
);
</script>
