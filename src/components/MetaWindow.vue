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
      :intial-values="props.intialValues"
      :loading="loading"
      :entity-title="entityTitle"
      :form="form"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import MetaEdit from "./MetaEdit.vue";
import MetaView from "./MetaView.vue";
import { useEditMode } from "../composables/useEdit";
import type {
  Form,
  IntialValues,
  MetadataAndRelation,
} from "../generated-types/queries";

const props = withDefaults(
  defineProps<{
    metadata: MetadataAndRelation[];
    form: Form;
    intialValues: IntialValues;
    entityTitle: string;
    loading: boolean;
  }>(),
  {
    entityTitle: "",
    loading: false,
  }
);

const { isEdit } = useEditMode();
const metadataComputed = ref<MetadataAndRelation[]>(props.metadata);

watch(
  () => props.metadata,
  (value) => {
    metadataComputed.value = value;
  }
);
</script>
