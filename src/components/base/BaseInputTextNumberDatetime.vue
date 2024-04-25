<template>
  <template v-if="type === 'fileSystemImport'">
    <ImportComponent />
  </template>
  <template v-else>
    <input
      v-if="type !== 'textarea' && type !== 'checkbox'"
      class="w-full h-full border rounded-lg focus:ring-0"
      :class="[
        `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
        `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
      ]"
      v-model="inputValue"
      :type="type"
      :step="step"
      :disabled="disabled"
      :placeholder="placeholder"
      @change.stop
      @click.stop
    />
    <input
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
      v-else
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
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import ImportComponent from "@/components/ImportComponent.vue";

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
    textColor: "disabled:text-text-disabled",
    bgColor: "disabled:bg-neutral-lightest",
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

type InputStyle = "default" | "defaultWithBorder";
const inputStyles: Record<InputStyle, Input> = {
  default: defaultInput,
  defaultWithBorder: defaultWithBorderInput,
};

const props = withDefaults(
  defineProps<{
    modelValue: string | number | undefined;
    inputStyle: InputStyle;
    type?: string;
    step?: number;
    disabled?: boolean;
    isValidPredicate?: Function;
    placeholder?: string;
  }>(),
  {
    type: "text",
    step: 1,
    disabled: false,
    isValidPredicate: () => true,
  }
);

const emit = defineEmits<{
  (
    event: "update:modelValue",
    modelValue: string | number | boolean | undefined
  ): void;
}>();

const inputValue = computed<string | number | boolean | undefined>({
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
