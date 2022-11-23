<template>
  <label
    class="block my-2"
    :class="type === 'checkbox' ? 'justify-end flex flex-row-reverse' : ''"
  >
    <span v-if="label" class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
    <div :class="[{ 'mr-4': icon }, inputContainerStyle]">
      <unicon
        v-if="icon"
        :name="icon"
        :class="[`h-full pl-2 text-neutral-700 bg-${bgColor}`]"
      />
      <input
        v-model="inputValue"
        :disabled="isDisabled"
        v-bind="$attrs"
        :class="[`bg-${bgColor}`, inputStyle]"
        :type="type"
        name=""
      />
    </div>
  </label>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import { debounce } from "ts-debounce";
export const lableStyle = 'ml-1 text-neutral-700 text-sm"';
export const inputContainerStyle =
  "flex flex-row bg-neutral-20 border border-neutral-50 rounded";
export const inputStyle =
  " py-2 pl-4  w-full rounded min-w-48 text-neutral-700 text-sm focus:outline-none";

export default defineComponent({
  name: "InputField",
  inheritAttrs: false,
  props: {
    label: { type: String, default: "" },
    modelValue: {
      type: String,
      default: "",
    },
    debounce: { type: Boolean, default: false },
    debounceWait: { type: Number, default: 400 },
    icon: { type: String, default: undefined },
    bgColor: { type: String, default: "neutral-0" },
    name: { type: String, default: "", required: false },
    isDisabled: { type: Boolean, default: false, required: false },
    type: { type: String, required: false, default: "text" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    let emitValue = (value: string) => emit("update:modelValue", value);

    if (props.debounce) {
      emitValue = debounce(emitValue, props.debounceWait);
    }

    const inputValue = computed<any>({
      get() {
        return props.modelValue;
      },
      set(value: string | boolean) {
        emitValue(value.toString());
      },
    });
    return { inputValue, inputStyle, inputContainerStyle };
  },
});
</script>
