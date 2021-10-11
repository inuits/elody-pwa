<template>
  <div v-if="true" class="mx-4">
    <IconToggle
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

  export type EditModes = 'edit' | 'view' | 'loading';

  const editMode = ref<EditModes>('view');

  export const useEditMode = () => {
    const setEditMode = () => (editMode.value = 'edit');
    const disableEditMode = () => (editMode.value = 'view');
    const isEdit = computed<boolean>(() => editMode.value === 'edit');

    return {
      isEdit,
      editMode,
      setEditMode,
      disableEditMode,
    };
  };

  export default defineComponent({
    name: 'EditToggle',
    components: { IconToggle },
    setup() {
      const toggleBoolean = ref<boolean>(false);
      const { disableEditMode, setEditMode, isEdit } = useEditMode();
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

      return {
        isEdit,
        Unicons,
        isSingle,
        toggleBoolean,
      };
    },
  });
</script>
