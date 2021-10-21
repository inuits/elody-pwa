<template>
  <div
    :class="[
      'w-2/6 overflow-scroll',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <meta-view v-if="!loading && !isEdit" :metadata="metadata" />
    <meta-edit
      v-if="!loading && isEdit"
      :error="error"
      :loading="loading"
      :metadata="metadata"
      :discard="discard"
      :entity-title="entityTitle"
      @addMetadata="addEditedMetadata"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, inject, PropType, Ref } from 'vue';
  import MetaEdit from '@/components/MetaEdit.vue';
  import MetaView from '@/components/MetaView.vue';
  import { Metadata } from '@/queries';
  import { useEditMode } from './EditToggle.vue';

  export default defineComponent({
    name: 'Meta',
    components: { MetaEdit, MetaView },
    props: {
      metadata: { type: Array as PropType<Metadata[]>, required: true },
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
