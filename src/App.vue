<template>
  <div>
    <BaseNotification />
    <the-navigation class="navbar" />
    <div :class="[`pl-24 h-screen flex flex-col`]">
      <the-header />
      <div :class="['flex-grow', { 'h-full overflow-hidden': isSingle }]">
        <router-view />
      </div>
    </div>
    <upload-modal :modal-position="'left'" />
    <edit-modal />
    <pick-entity-modal />
    <create-modal />
    <search-saved-searches-modal />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { DefaultOIDC, useAuth } from "session-vue-3-oidc-library";
import UploadModal from "./components/UploadModal.vue";
import CreateModal from "./components/CreateModal.vue";
import TheNavigation from "@/components/Menu.vue";
import TheHeader from "@/components/TheHeader.vue";
import EditModal from "./components/EditModal.vue";
import useRouteHelpers from "./composables/useRouteHelpers";
import { useHead } from "@vueuse/head";
import PickEntityModal from "./components/PickEntityModal.vue";
import BaseNotification from "./components/base/BaseNotification.vue";
import SearchSavedSearchesModal from "./components/searchSavedSearchesModal.vue";

export default defineComponent({
  name: "App",
  components: {
    UploadModal,
    TheNavigation,
    TheHeader,
    EditModal,
    PickEntityModal,
    CreateModal,
    BaseNotification,
    SearchSavedSearchesModal,
  },
  inject: { DefaultOIDC },
  setup() {
    const auth: Object = useAuth();
    const { isSingle } = useRouteHelpers();
    const contentPadding = ref("24");

    //Todo Fix vite migrations
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

.menu-item {
  margin-top: 2rem;
}

.menu-item:hover .menu-btn {
  --tw-bg-opacity: 1;
  fill: #02c6f2;
}

.navbar:hover .logo {
  writing-mode: horizontal-tb;
  margin-left: 0.7rem;
  transform: translate(2%, 25%);
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
.IsActive {
  fill: #02c6f2;
  color: #02c6f2;
  background-color: var(--color-neutral-40);
  border-radius: 8px;
  height: 2.3rem;}

@keyframes logo-animation {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(90deg);
  }
}
</style>
