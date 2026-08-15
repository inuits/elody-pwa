<template>
  <div>
    <BaseDatePicker
      v-model="inputValue"
      :type="type"
      :disabled="disabled"
      v-if="['date', 'datetime-local'].includes(type)"
    />
    <input
      data-cy="base-input-text"
      v-else-if="
        type !== 'textarea' &&
        type !== 'checkbox' &&
        type !== 'resizableTextarea' &&
        type !== 'datetime-local' &&
        type !== 'date'
      "
      class="ds-input"
      :class="[
        `ds-input--${inputStyle}`,
        { 'w-full h-full': type !== 'color' },
        { 'w-10 h-6 mt-2': type === 'color' },
      ]"
      v-model="inputValue"
      :type="type"
      :step="step"
      :min="min"
      :max="max"
      :disabled="disabled"
      :placeholder="placeholder"
      @keydown="handleKeydown"
      @focus="disableVirtualKeyboard"
      @change.stop
      @click="openCalendar"
      @input="handleBadNumberInput"
    />
    <input
      data-cy="base-input-checkbox"
      v-else-if="type === 'checkbox'"
      class="w-4 h-4 rounded-md ml-2"
      v-model="inputValue"
      :type="type"
      :disabled="disabled"
      :placeholder="placeholder"
      @change.stop
      @click.stop
    />
    <textarea
      data-cy="base-input-text-area"
      v-else-if="type === 'textarea'"
      class="ds-input w-full h-full"
      :class="`ds-input--${inputStyle}`"
      v-model="inputValue"
      :disabled="disabled"
      :placeholder="placeholder"
      @change.stop
      @click.stop
      rows="3"
    ></textarea>
    <BaseResizableTextarea
      v-else
      v-model="inputValue"
      class="ds-input"
      :class="`ds-input--${inputStyle}`"
    ></BaseResizableTextarea>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import BaseDatePicker from "./BaseDatePicker.vue";
import BaseResizableTextarea from "./BaseResizableTextarea.vue";

/** Chrome only — the ink, size and focus ring are the same for all three. */
export type InputStyle =
  | "default"
  | "defaultWithBorder"
  | "defaultWithDarkBackgroundInput";

const props = withDefaults(
  defineProps<{
    modelValue: string | number | undefined;
    inputStyle: InputStyle;
    type?: string;
    step?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    isValidPredicate?: (
      value: string | number | boolean | undefined,
    ) => boolean;
    placeholder?: string;
  }>(),
  {
    type: "text",
    step: 1,
    disabled: false,
    isValidPredicate: () => true,
  },
);

const emit = defineEmits<{
  (
    event: "update:modelValue",
    modelValue: string | number | boolean | undefined,
  ): void;
}>();

const inputValue = computed<string | number | boolean | undefined>({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (typeof value === "string") value = value?.trim();
    if (props.isValidPredicate(value)) emit("update:modelValue", value);
  },
});

const handleBadNumberInput = (event: Event) => {
  if (props.type !== "number") return;
  const target = event.target as HTMLInputElement;
  if (target.validity.badInput) {
    emit("update:modelValue", NaN);
  }
};
</script>

<style scoped>
.ds-input {
  border: 1px solid transparent;
  border-radius: var(--radius-input);
  background-color: var(--color-surface);
  color: var(--color-text-body);
  font-size: var(--text-value);
  transition: border-color var(--transition-duration-ui) var(--ease-ui);
}

.ds-input::placeholder {
  color: var(--color-text-placeholder);
}

/* One focus treatment for every control in the system. */
.ds-input:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
  border-color: transparent;
}

.ds-input:disabled {
  background-color: var(--color-surface-muted);
  color: var(--color-text-disabled);
  border-color: transparent;
}

.ds-input--defaultWithBorder {
  border-color: var(--color-border-default);
}

.ds-input--defaultWithDarkBackgroundInput {
  background-color: var(--color-surface-muted);
}

/* Numbers are read by their last digit: right-aligned, and never with the
   browser's spinners, which cover it. */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
  text-align: right;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.textarea {
  display: block;
  width: 100%;
  overflow: hidden;
  resize: both;
  min-height: 40px;
  line-height: 20px;
}
</style>
