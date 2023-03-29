<template>
  <div
    class="w-full px-6 py-8 border-b border-neutral-50 z-10 flex items-center justify-between bg-neutral-0"
  >
    <div class="flex w-full items-center">
      <BreadCrumbs />
      <EditToggle v-if="auth.isAuthenticated.value === true" />
    </div>
    <SearchBar />
  </div>
</template>

<script lang="ts" setup>
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import { useAuth } from "session-vue-3-oidc-library";
import SearchBar from "./SearchBar.vue";

const auth = useAuth();
</script>
