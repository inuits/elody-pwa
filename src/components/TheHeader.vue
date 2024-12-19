<template>
  <div
    class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white flex-wrap min-[1400px]:flex-nowrap"
  >
    <!-- <div class="flex w-full items-center"></div> -->
    <BreadCrumbs />
    <MetadataEditButton
      class="ml-0 min-[880px]:ml-6"
      v-if="showEditMetadataButton"
    />
    <DeleteButton v-if="showDeleteButton" />
    <LanguageSelect class="flex justify-end pr-2 min-[1400px]:ml-auto" />
    <tenant-switcher
      class="ml-6 w-64 flex justify-end pr-2"
      v-if="config.features.hasTenantSelect"
    />
    <!-- <div class="flex w-full justify-end px-2"></div> -->
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
import { auth } from "@/main";

const route = useRoute();
const config: any = inject("config");
const showSearch = config.features.simpleSearch.hasSimpleSearch;

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const isSingleEntityPage = computed(() => {
  return route.name === "SingleEntity" || route.name === "SingleMediafile";
});

const showDeleteButton = computed(() => {
  return isSingleEntityPage.value && auth.isAuthenticated.value;
});

const showEditMetadataButton = computed(() => {
  if (!isSingleEntityPage.value || !auth.isAuthenticated.value) return false;
  if (!entityType.value) return true;

  const meta = getRouteMetadataInfoFromEntity(config, entityType.value);
  if (meta?.hasEditMetadataButton !== undefined)
    return meta.hasEditMetadataButton;
  return true;
});
</script>
