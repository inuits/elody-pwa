<template>
  <VueDatePicker
    class="base-date-picker"
    v-model="dateValue"
    :time-config="{ enableTimePicker: enableTimePicker }"
    :teleport="someModalIsOpened ? '.base-modal--opened' : 'body'"
    :model-type="modelType"
    :formats="formats"
    :disabled="disabled"
    :placeholder="placeholder || t('date-picker.placeholder')"
    text-input
    auto-apply
  />
</template>

<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBaseModal } from "@/composables/useBaseModal";

const props = withDefaults(
  defineProps<{
    type: string;
    modelValue: string | undefined;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    // Typed entry is first-class, so the placeholder is the format itself.
    placeholder: "",
    type: "datetime",
    disabled: false,
  },
);

const { t } = useI18n();

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
    ? "dd-MM-yyyy HH:mm"
    : "dd-MM-yyyy";
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
/* The library is themed through the --dp-* variables its own rules read
   (date-picker.md: this spec replaces its raw styling — no ad-hoc fights). */
.dp__theme_light {
  /* Selected day: accent fill, white numeral. */
  --dp-primary-color: var(--color-accent);
  --dp-primary-text-color: var(--color-text-on-accent);
  --dp-text-color: var(--color-text-body);
  --dp-icon-color: var(--color-text-secondary);
  --dp-border-color: var(--color-border-default);
  --dp-menu-border-color: var(--color-border-default);
  --dp-border-color-hover: var(--color-border-default);
  --dp-hover-color: var(--color-surface-editable-hover);
  --dp-hover-text-color: var(--color-text-body);
  --dp-background-color: var(--color-surface);
  --dp-disabled-color-text: var(--color-text-subtle);
  /* 11.5px day grid; the popup card keeps the 8px overlay radius. */
  --dp-font-size: var(--text-label);
  --dp-border-radius: var(--radius-card);
  --dp-cell-border-radius: var(--radius-input);
}

/* Input: 5px radius, and the one focus treatment — the previous rules set
   outline-none on focus, which removed keyboard focus entirely. */
.base-date-picker .dp__input {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-input);
  font-size: var(--text-value);
}

.base-date-picker .dp__input:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.dp__menu {
  box-shadow: var(--shadow-overlay);
}

/* Today: ringed in commit teal, distinct from the accent-filled selection. */
.dp__today {
  border: 1px solid var(--color-commit);
}

.base-modal--opened:has(.base-date-picker) {
  overflow: visible !important;
}
</style>
