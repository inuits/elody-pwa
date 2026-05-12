<template>
  <div
    class="z-header flex items-center mx-6 my-8 px-6 py-4 rounded-3xl bg-background-light flex-wrap min-[1400px]:flex-nowrap"
  >
    <BreadCrumbs />
    <MetadataEditButton
      class="ml-0 min-[880px]:ml-6"
      v-if="showEditMetadataButton"
    />
    <EntityHeaderButton
      v-if="isSingleEntityPage && customDeleteButton"
      :label="customDeleteButton.label"
      :icon="customDeleteButton.icon"
      :mutation="customDeleteButton.mutation"
      :custom-style="customDeleteButton.style"
    />
    <DeleteButton v-else-if="showDeleteButton" />
    <HeaderContextMenuActions
      v-if="isSingleEntityPage && contextMenuActions.length > 0"
      :actions="contextMenuActions"
      :entity-id="entityId"
      :entity-type="entityType"
    />
    <LanguageSelect class="flex justify-end pr-2 ml-auto" />
    <tenant-switcher
      class="flex justify-end pr-2"
      v-if="config.features.hasTenantSelect"
    />
    <SearchBar
      class="flex justify-end"
      v-if="showSearch"
      :inputEnabled="false"
    />
  </div>
</template>

<script lang="ts" setup>
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import { useRoute } from "vue-router";
import LanguageSelect from "@/components/LanguageSelect.vue";
import SearchBar from "@/components/SearchBar.vue";
import TenantSwitcher from "@/components/menu/TenantSwitcher.vue";
import { inject, computed } from "vue";
import { getRouteMetadataInfoFromEntity, mapUrlToEntityType } from "@/helpers";
import DeleteButton from "@/components/DeleteButton.vue";
import EntityHeaderButton from "@/components/EntityHeaderButton.vue";
import HeaderContextMenuActions from "@/components/HeaderContextMenuActions.vue";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { auth } from "@/main";
import { usePageStatus } from "@/composables/usePageStatus";
import type { EntityButtonConfig } from "@/types/contextMenuRouteConfig";

const route = useRoute();
const config: any = inject("config");
const showSearch = !!config.features.simpleSearch;
const { pageStatus } = usePageStatus();
const {
  actions: contextMenuActions,
  hasEditMetadataButton: configEditMetadataButton,
  deleteButton: configDeleteButton,
} = useEntityPageConfig();

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const entityId = computed(() => String(route.params["id"] ?? ""));

const isSingleEntityPage = computed(() => {
  return route.name === "SingleEntity" || route.name === "SingleMediafile";
});

const customDeleteButton = computed<EntityButtonConfig | false>(() => {
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
