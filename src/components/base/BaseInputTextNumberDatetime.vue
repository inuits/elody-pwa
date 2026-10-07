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
      :readonly="readonly"
      :placeholder="placeholder"
      @change.stop
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
      class="w-full h-full resize-y min-h-(--textarea-min-height)"
      :class="fieldClasses"
      v-bind="a11yAttrs"
      v-model="inputValue"
      :disabled="disabled"
      :readonly="readonly"
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
    <p
      v-if="errorMessage"
      :id="errorId"
      role="alert"
      class="mt-0.5 text-hint text-danger"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, useId } from "vue";
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
const disabledStyle: PseudoStyle = {
  textColor: "disabled:text-text-disabled",
  bgColor: "disabled:bg-surface-muted",
  borderColor: "disabled:border-border-subtle",
};
// Borderless field on the light surface (filters, pagination).
const defaultInput: Input = {
  textColor: "text-text-body",
  bgColor: "bg-surface",
  borderColor: "border-transparent",
  disabledStyle: { ...disabledStyle, borderColor: "disabled:border-transparent" },
};
// The design-system input: 1px default border, one step darker on hover.
const defaultWithBorderInput: Input = {
  textColor: "text-text-body",
  bgColor: "bg-surface",
  borderColor: "border-border-default hover:border-input-border-hover",
  disabledStyle,
};
const defaultWithDarkBackgroundInput: Input = {
  textColor: "text-text-body",
  bgColor: "bg-accent-tint",
  borderColor: "border-transparent",
  disabledStyle: { ...disabledStyle, borderColor: "disabled:border-transparent" },
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
    readonly?: boolean;
    invalid?: boolean;
    // Rendered below the field as role="alert" and linked automatically.
    errorMessage?: string;
    // An external hint or message; kept alongside errorMessage.
    describedBy?: string;
    ariaLabel?: string;
    isValidPredicate?: (
      value: string | number | boolean | undefined,
    ) => boolean;
    placeholder?: string;
    // "compact" fits inside a chip (a value on a relation, e.g. a page number).
    size?: "default" | "compact";
  }>(),
  {
    size: "default",
    type: "text",
    step: 1,
    disabled: false,
    readonly: false,
    invalid: false,
    errorMessage: undefined,
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

const errorId = `input-error-${useId()}`;
const isInvalid = computed<boolean>(() => props.invalid || !!props.errorMessage);

// Design-system input; values come from the input component tokens. Focus is
// the global :focus-visible ring, so the forms-plugin ring is suppressed.
const fieldClasses = computed<string[]>(() => {
  const style = selectedInputStyle.value;
  const sizing =
    props.size === "compact"
      ? "text-label p-(--input-padding-compact) min-h-(--control-height-compact)"
      : "text-input p-(--input-padding) min-h-(--control-height)";
  const shape = `border rounded-input ${sizing} placeholder:text-text-placeholder focus:ring-0`;
  if (props.readonly)
    return [shape, style.textColor, "bg-transparent border-transparent"];
  return [
    shape,
    style.textColor,
    style.bgColor,
    isInvalid.value ? "border-danger hover:border-danger" : style.borderColor,
    style.disabledStyle.textColor,
    style.disabledStyle.bgColor,
    style.disabledStyle.borderColor,
  ];
});

const describedByIds = computed<string | undefined>(() => {
  const ids = [props.describedBy, props.errorMessage ? errorId : undefined];
  return ids.filter(Boolean).join(" ") || undefined;
});

const a11yAttrs = computed(() => ({
  "aria-invalid": isInvalid.value ? "true" : undefined,
  "aria-describedby": describedByIds.value,
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
