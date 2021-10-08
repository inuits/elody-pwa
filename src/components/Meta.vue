<template>
  <div class="w-2/6">
    <meta-view v-if="!isEdit" :metadata="metadata" />
    <meta-edit
      v-if="isEdit"
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
    },
    setup() {
      const { isEdit } = useEditMode();

      return {
        isEdit,
      };
    },
  });
</script>
