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
      :class="[
        fieldClasses,
        { 'w-full h-full': type !== 'color' },
        { 'w-10 h-6 mt-2': type === 'color' },
      ]"
      v-bind="a11yAttrs"
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
      class="w-full h-full resize-y"
      :class="fieldClasses"
      v-bind="a11yAttrs"
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
      :class="fieldClasses"
      v-bind="a11yAttrs"
    ></BaseResizableTextarea>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import BaseDatePicker from "./BaseDatePicker.vue";
import BaseResizableTextarea from "./BaseResizableTextarea.vue";

type PseudoStyle = {
  textColor: string;
  bgColor: string;
  borderColor: string;
};
type Input = {
  textColor: string;
  bgColor: string;
  borderColor: string;
  disabledStyle: PseudoStyle;
};
const defaultInput: Input = {
  textColor: "text-text-body",
  bgColor: "bg-background-light",
  borderColor: "border-none",
  disabledStyle: {
    textColor: "disabled:text-text-disabled",
    bgColor: "disabled:bg-background-normal",
    borderColor: "disabled:border-none",
  },
};
const defaultWithBorderInput: Input = {
  textColor: defaultInput.textColor,
  bgColor: defaultInput.bgColor,
  borderColor: "border-border-default hover:border-border-dashed",
  disabledStyle: {
    textColor: defaultInput.disabledStyle.textColor,
    bgColor: defaultInput.disabledStyle.bgColor,
    borderColor: "disabled:border-text-disabled",
  },
};
const defaultWithDarkBackgroundInput: Input = {
  textColor: defaultInput.textColor,
  bgColor: "bg-accent-tint",
  borderColor: defaultInput.borderColor,
  disabledStyle: {
    textColor: defaultInput.disabledStyle.textColor,
    bgColor: defaultInput.disabledStyle.bgColor,
    borderColor: defaultInput.disabledStyle.borderColor,
  },
};

type InputStyle =
  | "default"
  | "defaultWithBorder"
  | "defaultWithDarkBackgroundInput";
const inputStyles: Record<InputStyle, Input> = {
  default: defaultInput,
  defaultWithBorder: defaultWithBorderInput,
  defaultWithDarkBackgroundInput: defaultWithDarkBackgroundInput,
};

const props = withDefaults(
  defineProps<{
    modelValue: string | number | undefined;
    inputStyle: InputStyle;
    type?: string;
    step?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    invalid?: boolean;
    describedBy?: string;
    ariaLabel?: string;
    isValidPredicate?: (
      value: string | number | boolean | undefined,
    ) => boolean;
    placeholder?: string;
  }>(),
  {
    type: "text",
    step: 1,
    disabled: false,
    invalid: false,
    describedBy: undefined,
    ariaLabel: undefined,
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

const selectedInputStyle = computed<Input>(() => inputStyles[props.inputStyle]);

// Design-system input: 5px radius, 13px value, 5/8px padding; focus is the
// global :focus-visible ring, so the forms-plugin ring is suppressed here.
const fieldClasses = computed<string[]>(() => {
  const style = selectedInputStyle.value;
  return [
    "border rounded-input text-value py-[5px] px-2 placeholder:text-text-placeholder focus:ring-0",
    style.textColor,
    style.bgColor,
    props.invalid ? "border-danger hover:border-danger" : style.borderColor,
    style.disabledStyle.textColor,
    style.disabledStyle.bgColor,
    style.disabledStyle.borderColor,
  ];
});

const a11yAttrs = computed(() => ({
  "aria-invalid": props.invalid ? "true" : undefined,
  "aria-describedby": props.describedBy,
  "aria-label": props.ariaLabel,
}));

const handleBadNumberInput = (event: Event) => {
  if (props.type !== "number") return;
  const target = event.target as HTMLInputElement;
  if (target.validity.badInput) {
    emit("update:modelValue", NaN);
  }
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
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
