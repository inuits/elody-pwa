<template>
  <div v-if="field" class="text-sm pl-4 flex justify-between">
    <div class="h-10 block">
      <BaseInputTextNumberDatetime
        v-model="computedLongitude"
        label="Longitude"
        :type="field.type as any"
        :step="decimalPointStep"
        input-style="defaultWithBorder"
      />
      <p class="text-red-default">{{ errorMessage }}</p>
    </div>
    <div class="h-10 block">
      <BaseInputTextNumberDatetime
        v-model="computedLatitude"
        label="Latitude"
        :type="field.type as any"
        :step="decimalPointStep"
        input-style="defaultWithBorder"
      />
      <p class="text-red-default">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { getEntityIdFromRoute } from "@/helpers";
import { type PropType, computed, ref } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useField } from "vee-validate";
import { useI18n } from "vue-i18n";

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
const form: FormContext | undefined = getForm(id);
const { t } = useI18n();
const {
  errorMessage,
  value: fieldValue,
  setValue,
  errors,
} = useField("intialValues." + props.fieldKey, {
  label: t(props.label),
});

const setFormValues = (latitude: string, longitude: string) => {
  if (form) {
    form.setFieldValue(`intialValues.${props.fieldKey}`, {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  }
};

const computedLongitude = computed<any>({
  get() {
    return props.value.longitude;
  },
  set(value) {
    if (form) setFormValues(computedLatitude.value, value);
  },
});

const computedLatitude = computed<any>({
  get() {
    return props.value.latitude;
  },
  set(value) {
    if (form) setFormValues(value, computedLongitude.value);
  },
});
</script>
