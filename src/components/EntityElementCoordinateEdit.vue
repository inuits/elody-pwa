<template>
  <div v-if="field" class="text-sm pl-4 flex justify-between">
    <InputField
      v-model="refValue.longitude"
      label="Longitude"
      :type="field.type"
      :step="decimalPointStep"
    />
    <InputField
      v-model="refValue.latitude"
      label="Latitude"
      :type="field.type"
      :step="decimalPointStep"
    />
  </div>
</template>

<script lang="ts" setup>
import InputField from "./base/InputField.vue";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import { ref, type PropType, watch } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";

export type Location = {
  latitude: string;
  longitude: string;
};

const props = defineProps({
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Object as PropType<Location>, required: true },
  field: { type: Object as PropType<InputFieldType>, required: false },
});

const decimalPointStep = 0.000001;
const { getForm } = useFormHelper();
const id = getEntityIdFromRoute() || "";
const form: FormContext = getForm(id);

let refValue = ref(props.value);

watch(refValue.value, (value: Location) => {
  if (form) {
    form.setFieldValue(`intialValues.${props.fieldKey}`, {
      latitude: Number(value.latitude),
      longitude: Number(value.longitude),
    });
  }
});
</script>
