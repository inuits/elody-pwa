<template>
  <div
    :class="[
      'overflow-y-scroll',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <meta-view v-if="!loading && !isEdit" :metadata="metadata" :relations="relations" />
    <!-- <meta-edit
      v-if="!loading && isEdit"
      :error="error"
      :loading="loading"
      :metadata="metadata"
      :discard="discard"
      :entity-title="entityTitle"
      @addMetadata="addEditedMetadata"
    /> -->
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import MetaEdit from '@/components/MetaEdit.vue';
  import MetaView from '@/components/MetaView.vue';
  import { useEditMode } from './EditToggle.vue';
  import { Metadata, MetadataCollection, Relation } from '@/queries';

  export default defineComponent({
    name: 'Meta',
    components: { MetaView },
    props: {
      metadata: { type: Array as PropType<MetadataCollection[]>, required: true },
      entityTitle: { type: String, required: true },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const { isEdit } = useEditMode();

      return {
        isEdit,
      };
    },
  });
</script>
