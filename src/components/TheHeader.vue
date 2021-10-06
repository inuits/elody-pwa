<template>
  <div
    class="
      w-full
      px-6
      py-8
      border-b border-neutral-30
      z-10
      flex
      items-center
      justify-between
    "
  >
    <div class="flex w-full items-center">
      <h1 class="text-lg font-semibold text-neutral-800 float-left">
        {{ pageTitle }}
      </h1>
      <edit-toggle />
    </div>
    <div class="float-right">
      <BaseButton
        v-if="auth && !auth.isAuthenticated"
        label="Log in"
        bg-color="main-light"
        txt-color="main-dark"
        @click="auth && auth.login()"
      />
      <div v-if="auth?.isAuthenticated">
        <BaseButton :icon="Unicons.User.name" bg-color="neutral-30" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import BaseButton from './base/BaseButton.vue';
  import { Unicons } from '@/types';
  import EditToggle from './EditToggle.vue';

  const pageTitle = ref<string>('');

  export const usePageTitle = () => {
    const router = useRouter();

    const updatePageTitle = (input: string) => {
      pageTitle.value = input;
    };

    router.afterEach((to, _from, _failure) => {
      updatePageTitle(to.meta.title as string);
    });

    return {
      Unicons,
      pageTitle,
      updatePageTitle,
    };
  };

  export default defineComponent({
    name: 'TheHeader',
    components: { BaseButton, EditToggle },
    setup() {
      const { pageTitle } = usePageTitle();

      return {
        pageTitle,
      };
    },
  });
</script>
