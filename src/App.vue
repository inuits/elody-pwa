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
  import { defineComponent, inject, provide, ref, Ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Unicons } from '@/types';
  import BaseButton from '@/components/base/BaseButton.vue';
  import { DefaultOIDC, useAuth } from '@/OpenIdConnectPlugin';

  export const useUpdatePageTitle = () => inject<(title?: string) => void>('updatePageTitle')!;
  export function usePageTitle(x: Ref<string | undefined>) {
    const fn = useUpdatePageTitle();
    onMounted(() => fn(x.value));
    watch(x, (value) => fn(value));
  }

  export default defineComponent({
    name: 'App',
    components: { BaseButton },
    inject: { DefaultOIDC },
    setup() {
      const auth = useAuth();
      const route = useRoute();
      const router = useRouter();

      const pageTitle = ref<string>(route.meta.title as string);
      router.afterEach((to, _from, _failure) => {
        pageTitle.value = to.meta.title as string;
      });
      provide('updatePageTitle', (newTitle?: string) => {
        pageTitle.value = newTitle || '';
      });

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
