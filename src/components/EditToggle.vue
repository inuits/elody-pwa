<template>
  <div v-if="isEditToggleVisible" class="mx-4">
    <icon-toggle
      v-show="isSingle"
      v-model:checked="toggleBoolean"
      :icon-on="Unicons.Edit.name"
      :icon-off="Unicons.Eye.name"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue';
  import IconToggle from './base/IconToggle.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import { Unicons } from '@/types';
  import { toBeDeleted } from '@/components/EntityImageSelection.vue';
  import { useRouter } from 'vue-router';
  import useMediaAssetLinkHelper from '@/composables/useMediaAssetLinkHelper';
import useMetaDataHelper from '@/composables/useMetaDataHelper';
  export type EditModes = 'edit' | 'view' | 'loading';
  export type callback = (e?: Event | undefined) => Promise<unknown>;

  const editMode = ref<EditModes>('view');
  const saveCallbacks = ref<callback[]>([]);
  const isEditToggleVisible = ref<boolean>(false);

  export const useEditMode = () => {
    const { linkMediaFilesToEntity, clearMediaFilesToLinkToEntity } = useMediaAssetLinkHelper();
      const { clearMediaFilesToPatch } = useMetaDataHelper();
    const setEditMode = () => (editMode.value = 'edit');
    const disableEditMode = () => (editMode.value = 'view');
    const isEdit = computed<boolean>(() => editMode.value === 'edit');
    const addSaveCallback = (input: callback, first?: boolean) => {
      if (first) {
        saveCallbacks.value.unshift(input);
      } else {
        saveCallbacks.value.push(input);
      }
    };
    const showEditToggle = () => (isEditToggleVisible.value = true);
    const hideEditToggle = () => (isEditToggleVisible.value = false);
    const saveEvent = new Event('save');
    const discardEvent = new Event('discard');
    const save = () => {
      linkMediaFilesToEntity(addSaveCallback);
      saveCallbacks.value.forEach((callback: callback) => {
        callback().then(() => {
          if (isEdit.value) {
            saveCallbacks.value = [];
            disableEditMode();
            document.dispatchEvent(saveEvent);
          }
        });
      });
    };

    const discard = () => {
      disableEditMode();
      saveCallbacks.value = [];
      toBeDeleted.value = [];
      document.dispatchEvent(discardEvent);
      clearMediaFilesToLinkToEntity();
      clearMediaFilesToPatch();
    };

    return {
      save,
      isEdit,
      editMode,
      discard,
      setEditMode,
      addSaveCallback,
      disableEditMode,
      showEditToggle,
      hideEditToggle,
      isEditToggleVisible,
    };
  };

  export default defineComponent({
    name: 'EditToggle',
    components: { IconToggle },
    setup() {
      const toggleBoolean = ref<boolean>(false);
      const {
        disableEditMode,
        setEditMode,
        isEdit,
        hideEditToggle,
        isEditToggleVisible,
      } = useEditMode();
      const { isSingle } = useRouteHelpers();

      watch(toggleBoolean, (value: boolean) => {
        if (value) {
          setEditMode();
        } else {
          disableEditMode();
        }
      });

      watch(isEdit, (value: boolean) => {
        if (value) {
          toggleBoolean.value = true;
        } else {
          toggleBoolean.value = false;
        }
      });

      watch(isSingle, (value: boolean) => {
        if (value === false) {
          hideEditToggle();
        }
      });

      return {
        isEdit,
        Unicons,
        isSingle,
        toggleBoolean,
        isEditToggleVisible,
      };
    },
  });
</script>
