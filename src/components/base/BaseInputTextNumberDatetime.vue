<template>
  <input
    data-cy="base-input-text"
    v-if="
      type !== 'textarea' && type !== 'checkbox' && type !== 'resizableTextarea'
    "
    ref="baseInput"
    class=""
    :class="[
      'border rounded-lg focus:ring-0',
      { 'w-full h-full': type !== 'color' },
      { 'w-10 h-6 mt-2': type === 'color' },
      `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
      `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
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
    class="w-full h-full border rounded-lg focus:ring-0"
    :class="[
      `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
      `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
    ]"
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
    :class="[
      `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
      `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
    ]"
  ></BaseResizableTextarea>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
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
  borderColor: "border-[rgba(0,58,82,0.6)] focus:border-[rgba(0,58,82,0.6)]",
  disabledStyle: {
    textColor: defaultInput.disabledStyle.textColor,
    bgColor: defaultInput.disabledStyle.bgColor,
    borderColor: "disabled:border-text-disabled",
  },
};
const defaultWithDarkBackgroundInput: Input = {
  textColor: defaultInput.textColor,
  bgColor: "bg-accent-highlight",
  borderColor: defaultInput.borderColor,
  disabledStyle: {
    textColor: defaultInput.disabledStyle.textColor,
    bgColor: defaultInput.disabledStyle.bgColor,
    borderColor: defaultInput.disabledStyle.borderColor,
  },
};

type InputStyle = "default" | "defaultWithBorder" | "defaultWithDarkBackgroundInput";
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
    isValidPredicate?: Function;
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

const baseInput = ref<HTMLInputElement | null>(null);

const openCalendar = (event: KeyboardEvent) => {
  if (!["date", "datetime-local", "time"].includes(props.type)) {
    event.preventDefault();
    return;
  }

  if (baseInput.value.showPicker) {
    baseInput.value.showPicker();
  } else {
    baseInput.value.focus();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.type === "date") {
    event.preventDefault();
  }
};

const disableVirtualKeyboard = (event: FocusEvent) => {
  if (props.type !== "date") return;
  (event.target as HTMLInputElement).blur();
};

const selectedInputStyle = computed<Input>(() => inputStyles[props.inputStyle]);
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
