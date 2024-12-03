<template>
  <div
    class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white"
  >
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <EditToggle v-if="auth.isAuthenticated.value === true" />
      <!--      <EntityDetailHeaderContextMenu v-if="isSingle" />-->
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
import EditToggle from "@/components/toggles/EditToggle.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import SearchBar from "@/components/SearchBar.vue";
import TenantSwitcher from "@/components/menu/TenantSwitcher.vue";
import { inject } from "vue";
import { auth } from "@/main";
import useRouteHelpers from "@/composables/useRouteHelpers";
import EntityDetailHeaderContextMenu from "@/components/EntityDetailHeaderContextMenu.vue";
const { isSingle } = useRouteHelpers();

const auth: any = {};
const config: any = inject("config");
const showSearch = config.features.simpleSearch.hasSimpleSearch;
</script>
