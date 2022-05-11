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
      bg-neutral-0
    "
  >
    <div class="flex w-full items-center">
      <h1 class="text-lg font-semibold text-neutral-800 float-left">
        {{ pageTitle.routerTitle
        }}<span
          v-if="pageTitle.entityTitle !== '' && route.meta.showEntityTitle"
          class="text-neutral-400"
        >
          / {{ pageTitle.entityTitle }}</span
        >
      </h1>
      <edit-toggle />
      <BaseButton
        v-if="editMode === 'edit'"
        label="Delete"
        bg-color="red-default"
        bg-hover-color="red-dark"
        txt-color="neutral-0"
        @click="showConfirmation()"
      />
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
    <ConfirmationModal
      v-show="confirmState === 'show'"
      v-model:confirmState="confirmState"
      :function="deleteAsset"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import BaseButton from './base/BaseButton.vue';
  import { Unicons } from '@/types';
  import EditToggle from './EditToggle.vue';
  import { DeleteDataDocument, DeleteDataMutation, DeletePaths } from '@/queries';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { useEditMode } from '@/components/EditToggle.vue';
  import { asString } from '@/helpers';
  import ConfirmationModal from '@/components/base/ConfirmationModal.vue';

  type titleTypes = 'routerTitle' | 'entityTitle';

  type pageTitle = {
    routerTitle: string;
    entityTitle: string;
  };

  const pageTitle = ref<pageTitle>({
    routerTitle: '',
    entityTitle: '',
  });

  export const usePageTitle = () => {
    const router = useRouter();

    const updatePageTitle = (input: string, type: titleTypes = 'routerTitle') => {
      pageTitle.value[type] = input;
    };

    router.beforeEach((to, _from, next) => {
      updatePageTitle('', 'entityTitle');

      next();
    });

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
    components: { BaseButton, EditToggle, ConfirmationModal },
    setup() {
      const { pageTitle } = usePageTitle();
      const route = useRoute();

      const { editMode, addSaveCallback } = useEditMode();

      const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

      const deleteAsset = () => {
        const id = asString(route.params['id']);
        mutate({ id, path: DeletePaths.Entities });
      };

      const confirmState = ref<'hidden' | 'show'>('hidden');

      const showConfirmation = () => {
        confirmState.value = confirmState.value === 'show' ? 'hidden' : 'show';
      };

      return {
        route,
        pageTitle,
        editMode,
        deleteAsset,
        showConfirmation,
        confirmState,
      };
    },
  });
</script>
