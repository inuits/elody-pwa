<template>
  <div id="font-body">
    <nav
      class="
        fixed
        left-0
        top-0
        w-20
        h-screen
        flex flex-col
        justify-start
        align-center
        pt-10
        bg-neutral-20
        px-5
      "
    >
      <router-link
        :to="{ name: 'AssetLibrary' }"
        class="
          logo
          text-base text-neutral-700
          font-semibold
          flex
          justify-center
          items-center
          mb-8
        "
      >
        DAMS
      </router-link>
      <BaseButton
        :icon="Unicons.BookOpen.name"
        bg-color="neutral-30"
        @click="router.push({ name: 'AssetLibrary' })"
      />
      <BaseButton
        :icon="Unicons.History.name"
        bg-color="neutral-30"
        @click="router.push({ name: 'History' })"
      />
      <BaseButton
        :icon="Unicons.Upload.name"
        class="mt-1"
        bg-color="neutral-30"
        @click="() => updateUploadModal({ state: 'show' })"
      />
    </nav>
    <div class="pl-20 h-screen flex flex-col">
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
        <div class="flex w-full">
          <h1 class="text-lg font-semibold text-neutral-800 float-left">
            {{ pageTitle }}
          </h1>
          <div v-if="true" class="mx-4">
            <IconToggle
              v-show="!isHome"
              v-model:checked="editMode"
              :icon-on="Unicons.Edit.name"
              :icon-off="Unicons.Eye.name"
            />
          </div>
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
      <div class="flex-grow">
        <router-view />
      </div>
    </div>
    <upload-modal :modal-type="uploadModal" />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    inject,
    provide,
    ref,
    Ref,
    onMounted,
    watch,
    computed,
  } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Unicons } from '@/types';
  import BaseButton from '@/components/base/BaseButton.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import { DefaultOIDC, useAuth } from 'session-vue-3-oidc-library';
  import UploadModal, { UploadModalType } from '@/components/UploadModal.vue';
  import { store } from './store';

  export const useUpdatePageTitle = () =>
    inject<(title?: string) => void>('updatePageTitle')!;
  export function usePageTitle(x: Ref<string | undefined>) {
    const fn = useUpdatePageTitle();
    onMounted(() => fn(x.value));
    watch(x, (value) => fn(value));
  }

  export default defineComponent({
    name: 'App',
    components: { BaseButton, UploadModal, IconToggle },
    inject: { DefaultOIDC },
    setup() {
      const auth = useAuth();
      const route = useRoute();
      const router = useRouter();
      const editMode = ref<boolean>(false);

      const pageTitle = ref<string>(route.meta.title as string);
      router.afterEach((to, _from, _failure) => {
        pageTitle.value = to.meta.title as string;
      });
      provide('updatePageTitle', (newTitle?: string) => {
        pageTitle.value = newTitle || '';
      });
      const isHome = computed<boolean>(() => route.name === 'AssetLibrary');

      const uploadModal = ref<UploadModalType>({
        state: 'hide',
      });

      const updateUploadModal = (uploadModalInput: UploadModalType) => {
        uploadModal.value = uploadModalInput;
      };

      const updatedEditMode = () => {
        console.log('logging');
        store.commit('updateEditMode', !store.state.editMode);
      };

      provide<(uploadModalInput: UploadModalType) => void>(
        'updateUploadModal',
        updateUploadModal,
      );

      provide<(editMode: boolean) => void>('updateEditMode', (input: boolean) => {
        editMode.value = input;
      });
      provide<Ref<boolean>>('editMode', editMode);

      return {
        isHome,
        router,
        pageTitle,
        Unicons,
        auth,
        uploadModal,
        editMode,
        updateUploadModal,
        updatedEditMode,
      };
    },
  });
</script>

<style scoped>
  .logo {
    writing-mode: vertical-lr;
  }
</style>
