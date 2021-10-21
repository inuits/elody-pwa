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
    />
    <div v-if="!loading" class="flex flex-col items-end mt-2">
      <EntityComponentSelectionStrip v-if="showParents" :entities="parents" />
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
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import { MinimalEntityFragment } from '@/queries';
  import EntityComponentSelectionStrip from '@/components/EntityComponentsSelectionStrip.vue';
  import IconToggle from './base/IconToggle.vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'EntityComponentSelection',
    components: {
      EntityComponentSelectionStrip,
      IconToggle,
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

      return {
        Unicons,
        showParents,
        toggleParent,
      };
    },
  });
</script>
