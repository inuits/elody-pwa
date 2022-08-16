<template>
  <div
    v-show="mediafileSelectionState.selectedMediafile.metadata.length > 0"
    class="metainfo absolute bg-neutral-0 z-20 mx-4 mt-7 p-4 shadow-sm bottom-0"
  >
    <h3 class="text-sm text-neutral-700 font-semibold">Mediainfo</h3>
    <div v-if="!isEdit">
      <div
        v-for="item in mediafileSelectionState.selectedMediafile.metadata"
        :key="item.key"
        class="flex flex-col mb-2 mt-2"
      >
        <div class="label">{{ item.key }}</div>
        <div v-if="item.value" class="value">
          {{ item.value }}
        </div>
      </div>
    </div>
    <meta-edit-media v-else-if="form?.Form" :form="form?.Form" />
  </div>
</template>
<script lang="ts">
  import { GetFormsDocument, MediaFileMetadata } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { defineComponent, PropType, ref, watch } from 'vue';
  import { useEditMode } from '../EditToggle.vue';
  import MetaEditMedia from '@/components/base/MetaEditMedia.vue';
  import { useEntityMediafileSelector } from '../EntityImageSelection.vue';

  const { isEdit } = useEditMode();

  export default defineComponent({
    name: 'MediaInfo',
    components: { MetaEditMedia },
    props: {},
    setup(props) {
      const { mediafileSelectionState } = useEntityMediafileSelector();
      const { result: form } = useQuery(GetFormsDocument, {
        type: 'media',
      });

      return { isEdit, form, mediafileSelectionState };
    },
  });
</script>
<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }

  .metainfo {
    bottom: 1rem;
  }
</style>
