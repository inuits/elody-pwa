<template>
  <div class="flex items-center z-10 mx-6 my-8 px-6 py-4 rounded-3xl bg-neutral-white">
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <EditToggle v-if="auth.isAuthenticated.value === true" />
    </div>
    <SearchBar v-if="showSearch" />
    <LanguageSelect />
  </div>
</template>

<script lang="ts" setup>
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import { useAuth } from "session-vue-3-oidc-library";
import SearchBar from "./SearchBar.vue";
import EditToggle from "./EditButtons.vue";
import { inject } from "vue";
import LanguageSelect from "./LanguageSelect.vue";

const auth = useAuth();
const config: any = inject("config");
const showSearch = config.features.hasSimpleSearch;
</script>
