<template>
  <div class="w-2/6">
    <div>
      <meta-view v-if="!editMode" :edit-mode="editMode" :metadata="metadata" />
    </div>
    <div v-if="editMode" class="absolute w-2/6">
      <meta-edit
        v-if="metadata.length > 0"
        :error="error"
        :loading="loading"
        :metadata="metadata"
        :discard="discard"
        :entity-title="entityTitle"
        @addMetadata="addEditedMetadata"
      />
    </div>
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
      entityId: { type: String, default: '' },
      entityTitle: { type: String, required: true },
    },
    setup() {
      const { editMode } = useEditMode();

      return {
        editMode,
      };
    },
  });
</script>
