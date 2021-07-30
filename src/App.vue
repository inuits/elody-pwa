<template>
  <div id="font-body">
    <nav
      class="fixed left-0 top-0 w-20  h-screen flex flex-col justify-start align-center pt-10 bg-neutral-20 px-5"
    >
      <router-link
        :to="{ name: 'AssetLibrary' }"
        class="logo text-base text-neutral-700 font-semibold flex justify-center items-center mb-8"
      >
        DAMS
      </router-link>
      <BaseButton
        :icon="Unicons.BookOpen.name"
        bg-color="neutral-30"
        @click="router.push({ name: 'AssetLibrary' })"
      />
    </nav>
    <div class="pl-20 h-screen flex flex-col">
      <div class="w-full px-6 py-8 border-b border-neutral-30 bg-neutral-0 z-10">
        <h1 class="text-lg font-semibold text-neutral-800 float-left">
          {{ pageTitle }}
        </h1>
        <div class="float-right">
          <BaseButton
            v-if="auth && !auth.isAuthenticated"
            label="Log in"
            bg-color="main-light"
            txt-color="main-dark"
            @click="auth && auth.login()"
          />
          <div v-if="auth && auth.isAuthenticated">
            <BaseButton :icon="Unicons.User.name" bg-color="neutral-30" />
          </div>
        </div>
      </div>
      <div class="flex-grow">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, provide, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Unicons } from '@/types';
  import BaseButton from '@/components/base/BaseButton.vue';
  import { useAuth } from '@/OpenIdConnectPlugin';

  export type updatePageTitleType = (_newTitle: string) => void;
  export type setRoutePageTitleType = () => void;

  export default defineComponent({
    name: 'App',
    components: {
      BaseButton,
    },
    inject: ['Auth'],
    setup() {
      const auth = useAuth();
      const route = useRoute();
      const router = useRouter();

      // Provide option to update the page title
      const pageTitle = ref<string | unknown>(route.meta.title);
      const updatePageTitle: updatePageTitleType = (newTitle: string) => {
        pageTitle.value = newTitle;
      };
      const setRoutePageTitle: setRoutePageTitleType = () => {
        pageTitle.value = route.meta.title;
      };

      provide('updatePageTitle', updatePageTitle);
      provide('setRoutePageTitle', setRoutePageTitle);

      return {
        router,
        pageTitle,
        Unicons,
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
