<template>
  <div v-if="!showSplashScreen">
    <div v-if="!someModalIsOpened">
      <notifications class="pt-2" />
      <notifications
        class="pt-2 cursor-pointer"
        group="serviceVersionManager"
        @click="refreshPage()"
      />
    </div>
    <the-navigation class="navbar" />
    <div>
      <div class="bg-background-normal pl-24 h-screen flex flex-col">
        <the-header />
        <div :class="['grow', { 'h-0': isSingle }]">
          <router-view />
        </div>
      </div>
      <DynamicFormModal></DynamicFormModal>
      <SavedSearchesPickerModal />
      <CreateSavedSearchModal />
      <BulkoperationsModal v-if="route.name !== undefined" />
      <search-modal />
      <search-modal-ai />
      <!--      <BulkOperationsEditModal-->
      <!--        v-if="route.name !== undefined"-->
      <!--        :context="route.name as Context"-->
      <!--      />-->
      <EntityDetailModal />
      <ConfirmModal><ConfirmModalView /></ConfirmModal>
    </div>
  </div>
  <div
    v-else
    class="w-full h-screen flex justify-center items-center animate-pulse"
  >
    <img src="/logo.svg" alt="Elody logo" class="h-48" />
  </div>
</template>

<script setup lang="ts">
//import BulkOperationsEditModal from "@/components/bulk-operations/BulkOperationsEditModal.vue";
import BulkoperationsModal from "@/components/bulk-operations/BulkOperationsModal.vue";
import ConfirmModal from "./components/base/ConfirmModal.vue";
import ConfirmModalView from "./components/ConfirmModalView.vue";
import DynamicFormModal from "@/components/dynamicForms/DynamicFormModal.vue";
import SearchModal from "@/components/modals/SearchModal.vue";
import SavedSearchesPickerModal from "@/components/modals/SavedSearchesPickerModal.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/menu/MenuNav.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { inject, onMounted } from "vue";
import { useApp } from "@/composables/useApp";
import { auth } from "@/main";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import CreateSavedSearchModal from "./components/CreateSavedSearchModal.vue";
import EntityDetailModal from "@/components/modals/EntityDetailModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";

const config = inject<{
  features: { hasTenantSelect: boolean };
  allowAnonymousUsers: boolean;
}>("config");

const route = useRoute();
const { initApp, showSplashScreen } = useApp();
const { isSingle } = useRouteHelpers();
const { someModalIsOpened } = useBaseModal();

onMounted(async () => await initApp(auth, config));

useHead({
  meta: [
    {
      name: "ROBOTS",
      content: "NOINDEX, NOFOLLOW",
    },
  ],
});

const refreshPage = (): void => {
  window.location.reload();
};
</script>

<style>
@import "@/assets/main.css";

.navbar:hover ~ .move-by-nav,
.navbar:hover + .move-by-nav .move-by-nav {
  -webkit-transition: padding-left 300ms ease-in-out;
  -moz-transition: padding-left 300ms ease-in-out;
  -o-transition: padding-left 300ms ease-in-out;
  transition: padding-left 300ms ease-in-out;
  padding-left: 20rem;
}

.notification-title {
  @apply text-xl;
}

.notification-content {
  @apply text-base;
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
