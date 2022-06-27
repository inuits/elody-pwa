<template>
  <div id="font-body">
    <the-navigation />
    <div class="pl-20 h-screen flex flex-col">
      <the-header />
      <div :class="['flex-grow', { 'h-full overflow-hidden': isSingle }]">
        <router-view />
      </div>
    </div>
    <upload-modal />
    <edit-modal />
    <pick-asset-modal />
    <create-modal />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { DefaultOIDC, useAuth } from 'session-vue-3-oidc-library';
  import UploadModal from '@/components/UploadModal.vue';
  import CreateModal from '@/components/CreateModal.vue';
  import TheNavigation from '@/components/TheNavigation.vue';
  import TheHeader from '@/components/TheHeader.vue';
  import EditModal from '@/components/EditModal.vue';
  import useRouteHelpers from './composables/useRouteHelpers';
  import { useHead } from '@vueuse/head';
  import { environment as _ } from './environment';
  import PickAssetModal from '@/components/PickAssetModal.vue';

  export default defineComponent({
    name: 'App',
    components: {
      UploadModal,
      TheNavigation,
      TheHeader,
      EditModal,
      PickAssetModal,
      CreateModal,
    },
    inject: { DefaultOIDC },
    setup() {
      const auth = useAuth();
      const { isSingle } = useRouteHelpers();

      const getIndexValue = () => {
        let indexStr = '';
        if (_.index) {
          indexStr = 'INDEX, FOLLOW';
        } else {
          indexStr = 'NOINDEX, NOFOLLOW';
        }
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
      };
    },
  });
</script>

<style scoped>
  .logo {
    writing-mode: vertical-lr;
  }
</style>
