<template>
  <nav
    class="navbar fixed left-0 top-0 w-24 h-screen flex flex-col justify-start align-center pt-10 bg-neutral-20 px-5 z-50"
  >
    <router-link
      :to="{ name: 'Home' }"
      class="logo router-link text-base text-neutral-700 font-semibold flex justify-center items-center mb-8"
      @click="forceDisableEditModalHome"
    >
      DAMS
    </router-link>
    <div class="flex flex-row items-center" id="assets-item">
      <BaseButton
        :icon="Unicons.BookOpen.name"
        bg-color="neutral-30"
        @click="forceDisableEditModalHome"
        id="assets-btn"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
        @click="forceDisableEditModalHome"
        >Assets</span
      >
    </div>
    <div class="flex flex-row items-center" id="media-item">
      <BaseButton
        :icon="Unicons.FileAlt.name"
        bg-color="neutral-30"
        @click="forceDisableEditMediafiles"
        id="media-btn"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
        @click="forceDisableEditMediafiles"
      >
        Mediafiles
      </span>
    </div>
    <div class="flex flex-row items-center" id="jobs-item">
      <BaseButton
        :icon="Unicons.History.name"
        bg-color="neutral-30"
        class="mt-1"
        @click="forceDisableEditModalHistory"
        id="jobs-btn"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
        @click="forceDisableEditModalHistory"
        >Jobs</span
      >
    </div>
    <div class="flex flex-row items-center" id="import-item">
      <BaseButton
        :icon="Unicons.Upload.name"
        class="mt-1"
        bg-color="neutral-30"
        @click="openUploadModal(modalChoices.IMPORT)"
        id="import-btn"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
        @click="openUploadModal(modalChoices.IMPORT)"
        >Import</span
      >
    </div>
    <div class="flex flex-row items-center" id="create-item">
      <BaseButton
        :icon="Unicons.Create.name"
        class="mt-1"
        bg-color="neutral-30"
        @click="openCreateModal"
        id="create-btn"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
        @click="openCreateModal"
        >Create</span
      >
    </div>
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

      const forceDisableEditMediafiles = () => {
        router.push({ name: 'Mediafiles' });
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
        modalChoices,
        forceDisableEditMediafiles,
      };
    },
  });
</script>

<style scoped>
  .navbar {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  /* neutral-70 */
  #assets-item:hover #assets-btn {
    --tw-bg-opacity: 1;
    background-color: rgb(165 173 186 / var(--tw-bg-opacity));
  }

  #media-item:hover #media-btn {
    --tw-bg-opacity: 1;
    background-color: rgb(165 173 186 / var(--tw-bg-opacity));
  }

  #jobs-item:hover #jobs-btn {
    --tw-bg-opacity: 1;
    background-color: rgb(165 173 186 / var(--tw-bg-opacity));
  }

  #import-item:hover #import-btn {
    --tw-bg-opacity: 1;
    background-color: rgb(165 173 186 / var(--tw-bg-opacity));
  }

  #create-item:hover #create-btn {
    --tw-bg-opacity: 1;
    background-color: rgb(165 173 186 / var(--tw-bg-opacity));
  }

  .navbar:hover {
    width: 20rem;
  }

  .navbar:hover .router-link {
    padding-left: 0.3rem;
    justify-content: flex-start;
  }

  .navbar:hover .nav-item-label {
    animation: showText 0.1s ease-in 0.2s forwards;
    -moz-animation: showText 0.1s ease-in 0.2s forwards;
    -webkit-animation: showText 0.1s ease-in 0.2s forwards;
    -o-animation: showText 0.1s ease-in 0.2s forwards;
    animation-fill-mode: forwards;
  }

  @keyframes showText {
    100% {
      width: auto;
      height: auto;
    }
  }

  @-webkit-keyframes showText {
    100% {
      width: auto;
      height: auto;
    }
  }
</style>
