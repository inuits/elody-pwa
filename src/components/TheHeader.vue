<template>
  <div
    class="z-header flex items-center px-6 py-2.5 bg-neutral-white border-b border-neutral-30 flex-wrap min-[1400px]:flex-nowrap"
  >
    <BreadCrumbs />
    <!-- No "edit metadata" button: there is no page-wide edit mode anymore.
         Editing happens per field, per block or per row, in place. -->
    <EntityHeaderButton
      v-if="isSingleEntityPage && customDeleteButton"
      :config="customDeleteButton"
    />
    <!-- No standalone red delete button: delete lives last (and red) in
         the labeled "Actions" menu. -->
    <HeaderContextMenuActions
      v-if="
        isSingleEntityPage &&
        (contextMenuActions.length > 0 || showDeleteButton)
      "
      :actions="contextMenuActions"
      :entity-id="entityId"
      :entity-type="entityType"
      :has-extra-overflow-actions="showDeleteButton"
    >
      <template v-if="showDeleteButton" #extra-overflow>
        <DeleteButton variant="menu-item" />
      </template>
    </HeaderContextMenuActions>
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
import type { EntityButtonConfig, ToggleEntityButtonConfig } from "@/types/contextMenuRouteConfig";

const route = useRoute();
const config: any = inject("config");
const showSearch = !!config.features.simpleSearch;
const { pageStatus } = usePageStatus();
const { actions: contextMenuActions, deleteButton: configDeleteButton } =
  useEntityPageConfig();

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

</script>
