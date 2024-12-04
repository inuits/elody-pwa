<template>
  <div
    class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white"
  >
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <MetadataEditButton v-if="auth.isAuthenticated.value === true && determineEditMetadataButton"/>
      <DeleteButton v-if="auth.isAuthenticated.value === true && isSingleEntityPage"/>
    </div>
    <div class="flex w-full justify-end px-2">
      <LanguageSelect />
      <tenant-switcher
        class="ml-6 w-64"
        v-if="config.features.hasTenantSelect"
      />
    </div>
    <SearchBar v-if="showSearch" :inputEnabled="false" />
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
import { useAuth } from "session-vue-3-oidc-library";
import { getRouteMetadataInfoFromEntity, mapUrlToEntityType } from "@/helpers";
import DeleteButton from "@/components/DeleteButton.vue";

const auth = useAuth();
const route = useRoute()
const config: any = inject("config");
const showSearch = config.features.simpleSearch.hasSimpleSearch;

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const isSingleEntityPage = computed(() => {
  return route.name === "SingleEntity" || route.name === "SingleMediafile"
})

const determineEditMetadataButton = computed(() => {
  if (!isSingleEntityPage.value) return false;
  if (!entityType.value) return true;

  const meta = getRouteMetadataInfoFromEntity(config, entityType.value);
  if (meta?.hasEditMetadataButton !== undefined)
    return meta.hasEditMetadataButton
  return true;
});


</script>
