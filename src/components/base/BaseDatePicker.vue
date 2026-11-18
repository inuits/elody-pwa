<template>
  <VueDatePicker
    class="base-date-picker"
    v-model="dateValue"
    :time-config="{ enableTimePicker: enableTimePicker }"
    :teleport="someModalIsOpened ? modalTeleportTarget() : 'body'"
    :model-type="modelType"
    :formats="formats"
    :disabled="disabled"
    :placeholder="props.placeholder"
    text-input
    auto-apply
  />
</template>

<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { modalTeleportTarget } from "@/composables/useModalTeleportTarget";

const props = withDefaults(
  defineProps<{
    type: string;
    modelValue: string | undefined;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    placeholder: "Select date",
    type: "datetime",
    disabled: false,
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
    const value = newValue?.replace("Z", "+00:00") || "";
    emit("update:modelValue", value);
  },
});

const modelType = computed(() => {
  return enableTimePicker.value ? "yyyy-MM-dd'T'HH:mm:ssXXX" : "yyyy-MM-dd";
});

const formats = computed(() => {
  const format = props.type.includes("datetime")
    ? "dd/MM/yyyy HH:mm"
    : "dd/MM/yyyy";
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
/* Design-system input (components/input.md): same border, radius, size,
   height and focus ring as every other edit control. */
.dp__theme_light {
  --dp-primary-color: var(--color-commit);
  --dp-text-color: var(--color-text-body);
  --dp-border-color: var(--color-border-default);
  --dp-border-color-hover: var(--color-input-border-hover);
  --dp-font-family: var(--font-sans);
  /* Surfaces from tokens, so the picker follows dark mode */
  --dp-background-color: var(--color-surface);
  --dp-hover-color: var(--color-surface-muted);
  --dp-hover-text-color: var(--color-text-body);
  --dp-hover-icon-color: var(--color-text-secondary);
  --dp-icon-color: var(--color-text-muted);
  --dp-menu-border-color: var(--color-border-default);
  --dp-border-color-focus: var(--color-input-border-hover);
  --dp-disabled-color: var(--color-surface-muted);
  --dp-disabled-color-text: var(--color-text-muted);
  --dp-secondary-color: var(--color-text-subtle);
  --dp-scroll-bar-background: var(--color-surface-muted);
  --dp-scroll-bar-color: var(--color-text-muted);
  --dp-tooltip-color: var(--color-surface-muted);
}

.base-date-picker .dp__input {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-input);
  font-size: var(--text-input);
  min-height: var(--control-height);
  padding-block: 0;
  color: var(--color-text-body);
}

.base-date-picker .dp__input:hover {
  border-color: var(--color-input-border-hover);
}

.base-date-picker .dp__input:focus,
.base-date-picker .dp__input_focus {
  border-color: var(--color-border-default);
  box-shadow: none;
}

.base-date-picker .dp__icon {
  color: var(--color-text-secondary);
}

.base-modal--opened:has(.base-date-picker) {
  overflow: visible !important;
}
</style>
