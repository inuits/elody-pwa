<template>
  <div v-if="true" class="mx-4">
    <IconToggle
      v-show="isSingle"
      v-model:checked="editMode"
      :icon-on="Unicons.Edit.name"
      :icon-off="Unicons.Eye.name"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import IconToggle from './base/IconToggle.vue';
  import { useRoute } from 'vue-router';
  import { Unicons } from '@/types';

  const editMode = ref<boolean>(false);

  export const useEditMode = () => {
    const setEditMode = () => (editMode.value = true);
    const disableEditMode = () => (editMode.value = false);

    return {
      editMode,
      setEditMode,
      disableEditMode,
    };
  };

  export default defineComponent({
    name: 'EditToggle',
    components: { IconToggle },
    setup() {
      const { editMode } = useEditMode();
      const route = useRoute();
      const isSingle = computed<boolean>(() => route.name === 'SingleEntity');

      return {
        Unicons,
        isSingle,
        editMode,
      };
    },
  });
</script>
