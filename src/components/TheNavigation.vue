<template>
  <nav
    :class="[
      `fixed
      left-0
      top-0
      h-screen
      flex flex-col
      justify-start
      align-center
      pt-10
      bg-neutral-20
      px-5
      z-50
      transition-all`,
      hovered ? 'w-80' : 'w-24'
      ]"
    @mouseover="hoverIn"
    @mouseout="hoverOut"
  >
    <router-link
      :to="{ name: 'Home' }"
      :class="[
        `logo
        text-base text-neutral-700
        font-semibold
        flex
        items-center
        delay-100
        mb-8`,
        hovered ? 'pl-1' : 'justify-center',
      ]"
      @click="forceDisableEditModalHome"
    >
      DAMS
    </router-link>
    <div class="flex flex-row items-center">
      <BaseButton
        :icon="Unicons.BookOpen.name"
        bg-color="neutral-30"
        @click="forceDisableEditModalHome"
      />
      <span v-if="hovered" 
      class="px-4 transition-all delay-100 cursor-pointer pointer-events-none"
      @click="forceDisableEditModalHome"
      >Assets</span>
    </div>
    <div class="flex flex-row items-center">
      <BaseButton
      :icon="Unicons.FileAlt.name"
      bg-color="neutral-30"
      @click="forceDisableEditMediafiles"
      />
      <span v-if="hovered" 
      class="px-4 transition-all delay-100 cursor-pointer pointer-events-none"
      @click="forceDisableEditMediafiles">Mediafiles</span>
    </div>
    <div class="flex flex-row items-center">
      <BaseButton
      :icon="Unicons.History.name"
      bg-color="neutral-30"
      class="mt-1"
      @click="forceDisableEditModalHistory"
      />
      <span v-if="hovered" 
      class="px-4 transition-all delay-100 cursor-pointer pointer-events-none"
      @click="forceDisableEditModalHistory">Jobs</span>
    </div>
    <div class="flex flex-row items-center">
      <BaseButton
      :icon="Unicons.Upload.name"
      class="mt-1"
      bg-color="neutral-30"
      @click="openUploadModal(modalChoices.IMPORT)"
      />
      <span v-if="hovered" 
      class="px-4 transition-all delay-100 cursor-pointer pointer-events-none"
      @click="openUploadModal(modalChoices.IMPORT)">Import</span>
    </div>
    <div class="flex flex-row items-center">
      <BaseButton
      :icon="Unicons.Create.name"
      class="mt-1"
      bg-color="neutral-30"
      @click="openCreateModal"
      />
      <span v-if="hovered" 
      class="px-4 transition-all delay-100 cursor-pointer pointer-events-none"
      @click="openCreateModal">Create</span>
    </div>
  </nav>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import BaseButton from './base/BaseButton.vue';
  import { useUploadModal } from './UploadModal.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { useEditMode } from './EditToggle.vue';
  import { useCreateModal } from './CreateModal.vue';
  import LabelVue from './base/Label.vue';
  export default defineComponent({
    name: 'TheNavigation',
    components: { BaseButton, LabelVue },
    setup: () => {
      const { openUploadModal, modalChoices } = useUploadModal();
      const { openCreateModal } = useCreateModal();
      const router = useRouter();
      const { disableEditMode } = useEditMode();
      const hovered = ref(false);

      const forceDisableEditModalHome = () => {
        router.push({ name: 'Home' });
        disableEditMode();
      };

      const forceDisableEditModalHistory = () => {
        router.push({ name: 'History' });
        disableEditMode();
      };

      const forceDisableEditMediafiles = () => {
        router.push({ name: 'Mediafiles' });
        disableEditMode();
      };

      const forceDisableEditModalUpload = () => {
        useUploadModal();
        disableEditMode();
      };

      const hoverIn = () => {
        hovered.value = true;
      }

      const hoverOut = () => {
        hovered.value = false;
      }

      return {
        Unicons,
        openUploadModal,
        router,
        forceDisableEditModalHome,
        forceDisableEditModalHistory,
        forceDisableEditModalUpload,
        openCreateModal,
        modalChoices,
        forceDisableEditMediafiles,
        hovered,
        hoverIn,
        hoverOut
      };
    },
  });
</script>
