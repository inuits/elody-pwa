<template>
  <div
    class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white"
  >
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <MetadataEditButton v-if="auth.isAuthenticated.value === true && determineEditMetadataButton"/>
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
import LanguageSelect from "@/components/LanguageSelect.vue";
import SearchBar from "@/components/SearchBar.vue";
import TenantSwitcher from "@/components/menu/TenantSwitcher.vue";
import { inject, computed } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useRoute } from "vue-router";
import { getRouteMetadataInfoFromEntity } from "@/helpers";
import { Entitytyping } from "@/generated-types/queries";

const auth = useAuth();
const route = useRoute()
const config: any = inject("config");
const showSearch = config.features.simpleSearch.hasSimpleSearch;

const determineEditMetadataButton = computed(() => {
  if (route.name !== "SingleEntity" && route.name !== "SingleMediafile") return false;

  const possibleEntityType = route.fullPath.split("/")[1];
  const entityType = Object.values(Entitytyping).filter((entityType) => possibleEntityType === entityType)[0];
  if (!entityType) return true;

  const meta = getRouteMetadataInfoFromEntity(config, entityType);
  if (meta?.hasEditMetadataButton !== undefined)
    return meta.hasEditMetadataButton
  return true;
})
</script>
