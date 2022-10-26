<template>
  <div>
    <the-navigation class="navbar" :auth="auth" />
    <div :class="[`h-screen flex flex-col`, `move-by-nav`]">
      <the-header />
      <div :class="['flex-grow', { 'h-full overflow-hidden': isSingle }]">
        <router-view />
      </div>
    </div>
    <upload-modal />
    <edit-modal />
    <pick-entity-modal />
    <create-modal />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { DefaultOIDC, useAuth } from "session-vue-3-oidc-library";
import UploadModal from "@/components/UploadModal.vue";
import CreateModal from "@/components/CreateModal.vue";
import TheNavigation from "@/components/TheNavigation.vue";
import TheHeader from "@/components/TheHeader.vue";
import EditModal from "@/components/EditModal.vue";
import useRouteHelpers from "./composables/useRouteHelpers";
import { useHead } from "@vueuse/head";
import PickEntityModal from "@/components/PickEntityModal.vue";

export default defineComponent({
  name: "App",
  components: {
    UploadModal,
    TheNavigation,
    TheHeader,
    EditModal,
    PickEntityModal,
    CreateModal,
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
</style>
