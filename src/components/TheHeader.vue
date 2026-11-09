<template>
  <div
    :class="[
      'z-header flex items-center gap-2 bg-surface flex-wrap min-[1400px]:flex-nowrap',
      isCompact
        ? 'm-(--gutter-panels) mb-0 p-(--panel-header-pad) rounded-card border border-border-subtle *:ml-0 *:pl-0'
        : 'p-(--topbar-pad) border-b border-border-subtle',
    ]"
  >
    <!-- ui_kits AppShell: a flat full-width top bar; a card below md -->
    <EntityNavigationArrows v-if="!isCompact" class="mr-2" />
    <BreadCrumbs :class="{ 'basis-full': isCompact }">
      <template v-if="isCompact" #aside>
        <EntityNavigationArrows />
      </template>
    </BreadCrumbs>
    <!-- The page's create action, teleported in by its main list
         (ui_kits/clients: a pill next to the title). -->
    <div id="page-header-create" class="flex items-center ml-4 empty:hidden" />
    <MetadataEditButton
      class="ml-0 min-[880px]:ml-6"
      v-if="showEditMetadataButton"
    />
    <EntityHeaderButton
      v-if="isSingleEntityPage && customDeleteButton"
      :config="customDeleteButton"
    />
    <DeleteButton v-else-if="showDeleteButton" />
    <HistoryButton
      v-if="showHistoryButton"
      :entity-type="entityType"
      :entity-id="entityId"
    />
    <HeaderContextMenuActions
      v-if="isSingleEntityPage && contextMenuActions.length > 0"
      :actions="contextMenuActions"
      :entity-id="entityId"
      :entity-type="entityType"
    />
    <!-- Below md the drawer holds language and tenant, the top bar holds search -->
    <template v-if="!isCompact">
      <LanguageSelect class="flex justify-end pr-2 ml-auto" />
      <tenant-switcher
        class="flex justify-end pr-2"
        v-if="config.features.hasTenantSelect"
      />
    </template>
    <SearchBar
      v-if="showSearch && !isCompact"
      :inputEnabled="false"
    />
  </div>
</template>

<script lang="ts" setup>
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import EntityNavigationArrows from "@/components/EntityNavigationArrows.vue";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import { useRoute, useRouter } from "vue-router";
import LanguageSelect from "@/components/LanguageSelect.vue";
import SearchBar from "@/components/SearchBar.vue";
import TenantSwitcher from "@/components/menu/TenantSwitcher.vue";
import { inject, computed } from "vue";
import { getRouteMetadataInfoFromEntity, mapUrlToEntityType } from "@/helpers";
import DeleteButton from "@/components/DeleteButton.vue";
import EntityHeaderButton from "@/components/EntityHeaderButton.vue";
import HeaderContextMenuActions from "@/components/HeaderContextMenuActions.vue";
import HistoryButton from "@/components/HistoryButton.vue";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useNavMenu } from "@/composables/useNavMenu";
import { auth } from "@/main";
import type { EntityButtonConfig, ToggleEntityButtonConfig } from "@/types/contextMenuRouteConfig";

const route = useRoute();
const router = useRouter();
const config: any = inject("config");
const showSearch = !!config.features.simpleSearch;
const { isCompact } = useNavMenu();
const {
  actions: contextMenuActions,
  hasEditMetadataButton: configEditMetadataButton,
  deleteButton: configDeleteButton,
  showHistoryButton: configShowHistoryButton,
} = useEntityPageConfig();

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const entityId = computed(() => String(route.params["id"] ?? ""));

const isSingleEntityPage = computed(() => {
  return route.name === "SingleEntity" || route.name === "SingleMediafile";
});

const customDeleteButton = computed<EntityButtonConfig | ToggleEntityButtonConfig | false>(() => {
  if (!isSingleEntityPage.value || !auth.isAuthenticated.value) return false;
  const btn = configDeleteButton.value;
  if (btn === false) return false;
  if (btn !== undefined) return btn;
  return false;
});

const showDeleteButton = computed(() => {
  if (!isSingleEntityPage.value || !auth.isAuthenticated.value) return false;
  const btn = configDeleteButton.value;
  if (btn !== undefined) return false;
  const meta = getRouteMetadataInfoFromEntity(config, entityType.value);
  if (meta?.hasDeleteButton === false) return false;
  return true;
});

const showHistoryButton = computed(() => {
  if (!isSingleEntityPage.value) return false;
  return configShowHistoryButton.value && router.hasRoute("HistoryComparison");
});

const showEditMetadataButton = computed(() => {
  if (!isSingleEntityPage.value || !auth.isAuthenticated.value) return false;
  if (!entityType.value) return true;
  const fromConfig = configEditMetadataButton.value;
  if (fromConfig !== undefined) return fromConfig;
  const meta = getRouteMetadataInfoFromEntity(config, entityType.value);
  if (meta?.hasEditMetadataButton !== undefined) return meta.hasEditMetadataButton;
  return true;
});
</script>
