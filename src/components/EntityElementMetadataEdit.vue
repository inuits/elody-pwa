<template>
  <div v-if="field" class="text-sm pl-4">
    <InputField
      v-if="!isDropdownType"
      v-model="refValue"
      :label="label"
      :type="field.type"
    />
    <BaseDropdown v-else v-model="refValue" :label="label" :options="options" />
  </div>
</template>

<script lang="ts" setup>
import InputField from "./base/InputField.vue";
import BaseDropdown from "./base/BaseDropdown.vue";
import {
  ReplaceRelationsAndMetaDataDocument,
  type InputField as InputFieldType,
  type ReplaceRelationsAndMetaDataMutation,
} from "@/generated-types/queries";
import { computed, ref, watch, type PropType } from "vue";
import { useMutation } from "@vue/apollo-composable";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  field: { type: Object as PropType<InputFieldType>, required: false },
});

const { mutate, onDone } = useMutation<ReplaceRelationsAndMetaDataMutation>(
  ReplaceRelationsAndMetaDataDocument
);

const refValue = ref(props.value);

const isDropdownType = computed(() => {
  const dropdownTypes = ["dropdown", "dropdownMultiselect"];
  let isDropdown = false;
  if (props.field) {
    isDropdown = dropdownTypes.includes(props.field.type);
  }
  return isDropdown;
});

const options = computed(() => {
  const options =
    props.field && props.field.options ? (props.field.options as string[]) : [];
  return options;
});
</script>
