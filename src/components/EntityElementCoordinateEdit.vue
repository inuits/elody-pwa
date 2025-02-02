<template>
  <div
    data-cy="metadata-wrapper"
    v-if="inputField"
    class="text-text-light text-sm"
  >
    <p data-cy="metadata-label">
      {{ label ? t(label) : t("metadata.no-label") }}
    </p>
    <div data-cy="metadata-value" class="flex justify-between">
      <div class="h-10 block">
        <BaseInputTextNumberDatetime
          v-model="computedLatitude"
          label="Latitude"
          :type="inputField.type as any"
          :step="decimalPointStep"
          input-style="defaultWithBorder"
          :disabled="coordinateEditIsDisabled"
        />
        <p class="text-red-default">{{ errorMessage }}</p>
      </div>
      <div class="h-10 block">
        <BaseInputTextNumberDatetime
          v-model="computedLongitude"
          label="Longitude"
          :type="inputField.type as any"
          :step="decimalPointStep"
          input-style="defaultWithBorder"
          :disabled="coordinateEditIsDisabled"
        />
        <p class="text-red-default">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import type {
  Conditional,
  InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { type PropType, computed, onMounted, inject } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useField } from "vee-validate";
import { useEditMode } from "@/composables/useEdit";
import { useI18n } from "vue-i18n";
import { useConditionalValidation } from "@/composables/useConditionalValidation";

export type Location = {
  latitude: string;
  longitude: string;
};

const props = defineProps({
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Object as PropType<Location>, required: true },
  inputField: { type: Object as PropType<InputFieldType>, required: false },
  entityUuid: { type: String, required: true },
});

const mediafileViewerContext: any = inject("mediafileViewerContext");

const { isEdit } = useEditMode();
const decimalPointStep = 0.000001;
const { getForm } = useFormHelper();
const form: FormContext | undefined = getForm(props.entityUuid);
const { errorMessage } = useField("intialValues." + props.fieldKey);
const { conditionalFieldIsAvailable } = useConditionalValidation();
const coordinateEditIsDisabled = computed(() => {
  if (!isEdit.value) return true;
  if (!props.inputField?.validation?.available_if) return false;
  return !conditionalFieldIsAvailable(
    props.inputField.validation.available_if as Conditional,
    props.entityUuid,
    mediafileViewerContext
  );
});
const { t } = useI18n();

onMounted(() => {
  setFormValues(computedLatitude.value, computedLongitude.value);
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
    return props.value?.longitude;
  },
  set(value) {
    if (form) setFormValues(computedLatitude.value, value);
  },
});

const computedLatitude = computed<any>({
  get() {
    return props.value?.latitude;
  },
  set(value) {
    if (form) setFormValues(value, computedLongitude.value);
  },
});
</script>
