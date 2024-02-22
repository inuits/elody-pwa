<template>
  <div v-if="!showSplashScreen">
    <BaseNotification />
    <the-navigation class="navbar" />
    <div>
      <div
        class="bg-neutral-lightest"
        :class="[`pl-24 h-screen flex flex-col`]"
      >
        <the-header />
        <div :class="['flex-grow', { 'h-full overflow-hidden': isSingle }]">
          <router-view />
        </div>
        <edit-modal />
      </div>
      <EntityPickerModal />
      <DynamicFormModal></DynamicFormModal>
      <search-saved-searches-modal />
      <BulkoperationsModal
        v-if="route.name !== undefined"
        :context="route.name as Context"
      />
      <search-modal />
      <!--      <BulkOperationsEditModal-->
      <!--        v-if="route.name !== undefined"-->
      <!--        :context="route.name as Context"-->
      <!--      />-->
      <ConfirmModal><ConfirmModalView /></ConfirmModal>
    </div>
  </div>
  <div v-else class="w-full h-screen flex justify-center items-center">
    <img src="/logo.svg" alt="Elody logo" class="h-48" />
  </div>
</template>

<script setup lang="ts">
import type { Context } from "./composables/useBulkOperations";
import BaseNotification from "@/components/base/BaseNotification.vue";
//import BulkOperationsEditModal from "@/components/bulk-operations/BulkOperationsEditModal.vue";
import BulkoperationsModal from "@/components/bulk-operations/BulkOperationsModal.vue";
import ConfirmModal from "./components/base/ConfirmModal.vue";
import ConfirmModalView from "./components/ConfirmModalView.vue";
import DynamicFormModal from "@/components/dynamicForms/DynamicFormModal.vue";
import EditModal from "@/components/EditModal.vue";
import EntityPickerModal from "@/components/EntityPickerModal.vue";
import SearchModal from "@/components/SearchModal.vue";
import SearchSavedSearchesModal from "@/components/searchSavedSearchesModal.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/menu/MenuNav.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { inject, onMounted } from "vue";
import { useApp } from "@/composables/useApp";
import { useAuth } from "session-vue-3-oidc-library";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";

const auth = useAuth();
const config = inject<{
  features: { hasTenantSelect: boolean };
  allowAnonymousUsers: boolean;
}>("config");

const route = useRoute();
const { initApp, showSplashScreen } = useApp();
const { isSingle } = useRouteHelpers();

onMounted(async () => await initApp(auth, config));

useHead({
  meta: [
    {
      name: "ROBOTS",
      content: "NOINDEX, NOFOLLOW",
    },
  ],
});
</script>

<style>
@import "@/assets/base.css";

.logo {
  writing-mode: vertical-lr;
  font-size: 20px;
  font-weight: bold;
  transition: writing-mode 300ms ease-in-out, transform 300ms ease-in-out;
}

.move-by-nav {
  padding-left: 6rem;
  -webkit-transition: padding-left 300ms ease-in-out;
  -moz-transition: padding-left 300ms ease-in-out;
  -o-transition: padding-left 300ms ease-in-out;
  transition: padding-left 300ms ease-in-out;
}

.navbar:hover ~ .move-by-nav,
.navbar:hover + .move-by-nav .move-by-nav {
  -webkit-transition: padding-left 300ms ease-in-out;
  -moz-transition: padding-left 300ms ease-in-out;
  -o-transition: padding-left 300ms ease-in-out;
  transition: padding-left 300ms ease-in-out;
  padding-left: 20rem;
}

@keyframes logo-animation {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(90deg);
  }
}
</style>
