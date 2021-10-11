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
      class="mt-1"
      @click="router.push({ name: 'History' })"
    />
    <BaseButton
      :icon="Unicons.Upload.name"
      class="mt-1"
      bg-color="neutral-30"
      @click="openUploadModal"
    />
  </nav>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import BaseButton from './base/BaseButton.vue';
  import { useUploadModal } from './UploadModal.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'TheNavigation',
    components: { BaseButton },
    setup: () => {
      const { openUploadModal } = useUploadModal();
      const router = useRouter();

      return { Unicons, openUploadModal, router };
    },
  });
</script>
