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
      :loading="loading"
      :entity-title="entityTitle"
      :form="form"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import MetaEdit from "@/components/MetaEdit.vue";
import MetaView from "@/components/MetaView.vue";
import { useEditMode } from "@/composables/useEdit";
import type { Form, MetadataAndRelation } from "@/queries";

const props = withDefaults(
  defineProps<{
    metadata: MetadataAndRelation[];
    form: Form;
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
