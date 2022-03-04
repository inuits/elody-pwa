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
    <meta-edit
      v-if="!loading && isEdit && form"
      :error="error"
      :loading="loading"
      :metadata="metadata"
      :discard="discard"
      :entity-title="entityTitle"
      :form="form"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import MetaEdit from '@/components/MetaEdit.vue';
  import MetaView from '@/components/MetaView.vue';
  import { useEditMode } from './EditToggle.vue';
  import { Form, MetadataAndRelation } from '@/queries';

  export default defineComponent({
    name: 'Meta',
    components: { MetaView, MetaEdit },
    props: {
      metadata: { type: Array as PropType<MetadataAndRelation[]>, required: true },
      form: { type: Object as PropType<Form>, required: false },
      entityTitle: { type: String, required: false, default: undefined },
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
