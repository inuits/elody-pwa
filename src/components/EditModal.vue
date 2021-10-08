<template>
  <div
    v-if="isEdit"
    class="
      absolute
      bottom-6
      z-20
      flex flex-column
      rounded
      gap-x-2
      bg-neutral-0
      shadow-2xl
      px-4
      py-2
      ml-6
    "
  >
    <BaseButton
      :bg-color="'blue-400'"
      :txt-color="'neutral-0'"
      label="Save"
      @click="save()"
    />
    <BaseButton
      label="Discard"
      bg-color="'neutral-0'"
      :border-color="'red-default'"
      :txt-color="'red-default'"
      @click="discard()"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, provide, ref } from 'vue';
  import { useEditMode } from './EditToggle.vue';
  import BaseButton from '@/components/base/BaseButton.vue';

  export default defineComponent({
    naem: 'EditModal',
    components: {
      BaseButton,
    },
    setup() {
      const { disableEditMode, isEdit } = useEditMode();
      const saveCallbacks = ref<{ (): Promise<void> }[]>([]);

      provide('saveCallBacks', saveCallbacks.value);
      provide('addSaveCallBacks', (input: () => Promise<void>) =>
        saveCallbacks.value.push(input),
      );

      const save = () => {
        saveCallbacks.value.forEach((callback: () => Promise<void>) => {
          callback().then(() => {
            if (isEdit) {
              disableEditMode();
            }
          });
        });
      };

      const discard = () => {
        disableEditMode();
        saveCallbacks.value = [];
      };

      return {
        save,
        isEdit,
        discard,
      };
    },
  });
</script>
