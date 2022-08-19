<template>
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
      z-50
    "
  >
    <router-link
      :to="{ name: 'Home' }"
      class="
        logo
        text-base text-neutral-700
        font-semibold
        flex
        justify-center
        items-center
        mb-8
      "
      @click="forceDisableEditModalHome"
    >
      DAMS
    </router-link>
    <BaseButton
      :icon="Unicons.BookOpen.name"
      bg-color="neutral-30"
      @click="forceDisableEditModalHome"
    />
    <BaseButton
      :icon="Unicons.History.name"
      bg-color="neutral-30"
      class="mt-1"
      @click="forceDisableEditModalHistory"
    />
    <BaseButton
      :icon="Unicons.Upload.name"
      class="mt-1"
      bg-color="neutral-30"
      @click="openUploadModal(modalChoices.IMPORT)"
    />
    <BaseButton
      :icon="Unicons.Create.name"
      class="mt-1"
      bg-color="neutral-30"
      @click="openCreateModal"
    />
  </nav>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import BaseButton from './base/BaseButton.vue';
  import { useUploadModal } from './UploadModal.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { useEditMode } from './EditToggle.vue';
  import { useCreateModal } from './CreateModal.vue';
  export default defineComponent({
    name: 'TheNavigation',
    components: { BaseButton },
    setup: () => {
      const { openUploadModal, modalChoices } = useUploadModal();
      const { openCreateModal } = useCreateModal();
      const router = useRouter();
      const { disableEditMode } = useEditMode();

      const forceDisableEditModalHome = () => {
        router.push({ name: 'Home' });
        disableEditMode();
      };

      const forceDisableEditModalHistory = () => {
        router.push({ name: 'History' });
        disableEditMode();
      };

      const forceDisableEditModalUpload = () => {
        useUploadModal();
        disableEditMode();
      };

      return {
        Unicons,
        openUploadModal,
        router,
        forceDisableEditModalHome,
        forceDisableEditModalHistory,
        forceDisableEditModalUpload,
        openCreateModal,
        modalChoices
      };
    },
  });
</script>
