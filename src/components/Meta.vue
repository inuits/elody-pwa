<template>
  <div
    :class="[
      'overflow-y-scroll',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <meta-view
      v-if="(!loading && !isEdit) || (isEdit && !form)"
      :metadata="metadataComputed"
    />
    <meta-edit
      v-if="!loading && isEdit && form"
      v-model="metadataComputed"
      :error="error"
      :loading="loading"
      :discard="discard"
      :entity-title="entityTitle"
      :form="form"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import MetaEdit from "@/components/MetaEdit.vue";
import MetaView from "@/components/MetaView.vue";
import { useEditMode } from "@/composables/useEdit";
import { Form, MetadataAndRelation } from "@/queries";

export default defineComponent({
  name: "Meta",
  components: { MetaView, MetaEdit },
  props: {
    metadata: {
      type: Array as PropType<MetadataAndRelation[]>,
      required: true,
    },
    form: { type: Object as PropType<Form>, required: false },
    entityTitle: { type: String, required: false, default: undefined },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { isEdit } = useEditMode();
    const metadataComputed = ref<MetadataAndRelation[]>(props.metadata);

    watch(
      () => props.metadata,
      (value) => {
        metadataComputed.value = value;
      }
    );

    return {
      isEdit,
      metadataComputed,
    };
  },
});
</script>
