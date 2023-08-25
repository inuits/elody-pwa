<template>
  <div>
    <BaseNotification />
    <the-navigation class="navbar" />
    <div class="bg-neutral-lightest" :class="[`pl-24 h-screen flex flex-col`]">
      <the-header />
      <div :class="['flex-grow', { 'h-full overflow-hidden': isSingle }]">
        <router-view />
      </div>
      <edit-modal />
    </div>
    <upload-modal />
    <EntityPickerModal />
    <create-modal />
    <search-saved-searches-modal />
    <BulkoperationsModal
      v-if="route.name !== undefined"
      :context="route.name as Context"
    />
    <ConfirmModal><DiscardModal /></ConfirmModal>
  </div>
</template>

<script lang="ts">
import type { Context } from "@/composables/useBulkOperations";
import BaseNotification from "@/components/base/BaseNotification.vue";
import BulkoperationsModal from "@/components/bulk-operations/BulkOperationsModal.vue";
import CreateModal from "@/components/CreateModal.vue";
import EditModal from "@/components/EditModal.vue";
import EntityPickerModal from "@/components/EntityPickerModal.vue";
import SearchSavedSearchesModal from "@/components/searchSavedSearchesModal.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/menu/MenuNav.vue";
import UploadModal from "@/components/UploadModal.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { DefaultOIDC, useAuth } from "session-vue-3-oidc-library";
import { defineComponent, ref } from "vue";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import ConfirmModal from "./components/base/ConfirmModal.vue";
import DiscardModal from "./components/DiscardModal.vue";

export default defineComponent({
  name: "App",
  components: {
    BaseNotification,
    BulkoperationsModal,
    CreateModal,
    EditModal,
    EntityPickerModal,
    SearchSavedSearchesModal,
    TheHeader,
    TheNavigation,
    UploadModal,
    ConfirmModal,
    DiscardModal,
  },
  inject: { DefaultOIDC },
  setup() {
    const auth: Object = useAuth();
    const { isSingle } = useRouteHelpers();
    const contentPadding = ref("24");
    const route = useRoute();

    // TODO: Fix vite migrations
    const getIndexValue = () => {
      let indexStr = "";
      // if (_.index) {
      //   indexStr = "INDEX, FOLLOW";
      // } else {
      indexStr = "NOINDEX, NOFOLLOW";
      // }
      return indexStr;
    };

    useHead({
      meta: [
        {
          name: `ROBOTS`,
          content: getIndexValue(),
        },
      ],
    });

    return {
      auth,
      isSingle,
      contentPadding,
      route,
    };
  },
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
