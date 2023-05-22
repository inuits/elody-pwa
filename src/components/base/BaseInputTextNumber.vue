<template>
  <input
    class="w-full h-full rounded-lg focus:ring-0"
    :class="[
      `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
      `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
    ]"
    v-model="inputValue"
    :type="type"
    :disabled="disabled"
    @change.stop
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed } from "vue";

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
  bgColor: "bg-neutral-white",
  borderColor: "border-none",
  disabledStyle: {
    textColor: "disabled:text-text-light",
    bgColor: "disabled:bg-neutral-lightest",
    borderColor: "disabled:border-none",
  },
};

type InputStyle = "default";
const inputStyles: Record<InputStyle, Input> = {
  default: defaultInput,
};

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    type?: "text" | "number";
    inputStyle: InputStyle;
    disabled?: boolean;
    isValidPredicate?: Function;
  }>(),
  {
    type: "text",
    disabled: false,
    isValidPredicate: () => true,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: string | number): void;
}>();

const inputValue = computed<string | number>({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (props.isValidPredicate(value)) emit("update:modelValue", value);
  },
});

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
</style>
