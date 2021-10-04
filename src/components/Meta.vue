<template>
    <div class="w-2/6">
      <div>
        <MetaView v-if="!editMode" :editMode="editMode" :metadata="updatedMetadata" />
      </div>
      <div v-if="editMode" class="absolute  w-2/6">
          <MetaEdit
          :error="error"
          :loading="loading"
          :metadata="updatedMetadata"
          :discard="discard"
          @addMetadata="addEditedMetadata"
          />
        </div>
      </div>
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, ref } from 'vue';
  import MetaEdit from '@/components/MetaEdit.vue';
  import MetaView from '@/components/MetaView.vue';
  import { EditMetadataDocument, Metadata, MetadataInput, MetaKey } from '@/queries';


  export default defineComponent({
    name: 'Meta',
    components: { MetaEdit, MetaView },
    props: {
      metadata:{ type: Array as PropType<Metadata[]>, required: true },
      editMode: { type: true || false, default: false},
      entityId: { type: String, default: ''},
    },
    setup(props) {
      const editedValue = ref<Metadata[]>(props.metadata);
      const addEditedMetadata = (metadata: Metadata[]) => {
        metadata.map(item => {
          editedValue.value.push(item);
        }); 
      };

      return {
        addEditedMetadata,
        updatedMetadata: computed(() => editedValue.value),
      };
    },
  });
</script>