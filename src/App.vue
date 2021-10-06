<template>
  <div id="font-body">
    <the-navigation />
    <div class="pl-20 h-screen flex flex-col">
      <the-header />
      <div class="flex-grow">
        <router-view />
      </div>
    </div>
    <upload-modal />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { DefaultOIDC, useAuth } from 'session-vue-3-oidc-library';
  import UploadModal from '@/components/UploadModal.vue';
  import TheNavigation from '@/components/TheNavigation.vue';
  import TheHeader from '@/components/TheHeader.vue';

  export default defineComponent({
    name: 'App',
    components: { UploadModal, TheNavigation, TheHeader },
    inject: { DefaultOIDC },
    setup() {
      const auth = useAuth();

      return {
        auth,
      };
    },
  });
</script>

<style scoped>
  .logo {
    writing-mode: vertical-lr;
  }
</style>
