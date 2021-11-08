<template>
  <div
    :class="[
      'flex flex-col items-center p-2',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <IconToggle
      v-show="!loading"
      v-model:checked="showParents"
      :icon-on="Unicons.SortUp.name"
      :icon-off="Unicons.SortDown.name"
      class="justify-self-start"
    />
    <div v-if="!loading" class="flex flex-col items-end mt-2 overflow-y-scroll">
      <EntityComponentSelectionStrip v-if="showParents" :entities="parents"/>
      <span
        v-show="showParents && parents.length === 0"
        class="w-full text-center font-light py-2"
        >No parent assets</span
      >
      <img
        v-if="thumbnail"
        :class="[
          'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-blue-500 border-4',
        ]"
        :src="thumbnail"
      />
      <EntityComponentSelectionStrip v-if="!showParents" :entities="entities" />
      <span
        v-show="!showParents && entities.length === 0"
        class="w-full text-center font-light py-2"
        >No child assets</span
      >
    </div>
    <BaseButton
      v-show="isEdit && !showParents"
      label="Add child"
      :icon="Unicons.PlusCircle.name"
      :icon-color="'var(--color-neutral-10)'"
      :bg-color="'blue-400'"
      :txt-color="'neutral-0'"
      @click="openPickAssetModal"
      class="justify-self-end"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, onUnmounted, PropType, ref, watch } from 'vue';
  import { MinimalEntityFragment } from '@/queries';
  import EntityComponentSelectionStrip from '@/components/EntityComponentsSelectionStrip.vue';
  import IconToggle from './base/IconToggle.vue';
  import { Unicons } from '@/types';
  import { useEditMode } from './EditToggle.vue';
  import BaseButton from './base/BaseButton.vue';
  import { usePickAssetModal } from './PickAssetModal.vue';

  export default defineComponent({
    name: 'EntityComponentSelection',
    components: {
      EntityComponentSelectionStrip,
      IconToggle,
      BaseButton,
    },
    props: {
      entities: { type: Array as PropType<MinimalEntityFragment[]>, required: true },
      parents: { type: Array as PropType<MinimalEntityFragment[]>, required: true },
      thumbnail: { type: String },
      selectedId: {
        type: String,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const showParents = ref<boolean>(false);
      const { isEdit, disableEditMode } = useEditMode();
      const { openPickAssetModal } = usePickAssetModal();

      const toggleParent = () => {
        showParents.value = !showParents.value;
      };

      watch(
        () => props.selectedId,
        () => {
          console.log('watcher');
          showParents.value = false;
        },
      );

      onUnmounted(() => {
        disableEditMode();
      });

      return {
        isEdit,
        Unicons,
        showParents,
        toggleParent,
        openPickAssetModal,
      };
    },
  });
</script>
