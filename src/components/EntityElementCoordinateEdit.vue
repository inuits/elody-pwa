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
import type { FormContext } from "vee-validate";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import InputField from "@/components/base/InputField.vue";
import { getEntityIdFromRoute } from "@/helpers";
import { ref, type PropType, watch, onMounted } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";

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

const setFormValues = (latitude: string, longitude: string) => {
  if (form) {
    form.setFieldValue(`intialValues.${props.fieldKey}`, {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  }
};

onMounted(() =>
  setFormValues(refValue.value.latitude, refValue.value.longitude)
);

watch(refValue.value, (value: Location) =>
  setFormValues(value.latitude, value.longitude)
);
</script>
