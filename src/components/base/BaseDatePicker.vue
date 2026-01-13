<template>
  <VueDatePicker
    class="base-date-picker"
    v-model="dateValue"
    :time-config="{ enableTimePicker: enableTimePicker }"
    :teleport="someModalIsOpened ? '.base-modal--opened' : 'body'"
    :model-type="modelType"
    :formats="formats"
    :placeholder="props.placeholder"
    text-input
  />
</template>

<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";

const props = withDefaults(
  defineProps<{
    type: string;
    modelValue: string | undefined;
    placeholder?: string;
  }>(),
  {
    placeholder: "Select date",
    type: "datetime",
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: string | undefined): void;
}>();

const { someModalIsOpened } = useBaseModal();

const dateValue = computed<string | undefined>({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    const value = newValue?.replace('Z', '+00:00') || "";
    emit("update:modelValue", value);
  },
});

const modelType = computed(() => {
  return "yyyy-MM-dd'T'HH:mm:ssXXX";
});

const formats = computed(() => {
  const format = props.type.includes("datetime") ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
  return {
    preview: format,
    input: format,
  };
});

const enableTimePicker = computed<boolean>(() => {
  return props.type.includes("time");
});
</script>

<style>
.dp__theme_light {
  --dp-primary-color: var(--color-accent-accent);
}

.base-date-picker .dp__input {
  @apply border border-[rgba(0,58,82,0.6)] rounded-[0.5rem] focus:border-[rgba(0,58,82,0.6)]!;
}

.base-date-picker .dp__input:focus,
.base-date-picker .dp__input:hover,
.base-date-picker .dp__input_focus {
  @apply border-[rgba(0,58,82,0.6)]! outline-none!;
  box-shadow: none !important;
}

.base-date-picker .dp__icon {
  color: var(--color-black);
}
</style>
