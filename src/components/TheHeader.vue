<template>
  <div
    class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white"
  >
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <EditToggle v-if="auth.isAuthenticated.value === true" />
    </div>
    <div class="flex w-full justify-end px-2">
      <LanguageSelect />
      <tenant-switcher v-if="config.features.hasTenantSelect" />
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
import { useAuth } from "session-vue-3-oidc-library";

const auth = useAuth();
const config: any = inject("config");
const showSearch = config.features.simpleSearch.hasSimpleSearch;
</script>
