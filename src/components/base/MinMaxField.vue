<template>
  <label class="block my-2">
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
        type="number"
        :min="props.min"
        :max="props.max"
      />
    </div>
  </label>
</template>

<script lang="ts">
  import { defineComponent, PropType, computed, ref, watch } from 'vue';
  import { Unicons } from '@/types';
  import { debounce } from 'ts-debounce';
  export const lableStyle = 'ml-1 text-neutral-700 text-sm"';
  export const inputContainerStyle =
    'flex flex-row bg-neutral-20 border border-neutral-30 rounded';
  export const inputStyle =
    ' py-2 pl-4  w-full rounded min-w-48 text-neutral-700 text-sm focus:outline-none';

  export default defineComponent({
    name: 'InputField',

    inheritAttrs: false,
    props: {
      label: { type: String, default: '' },
      modelValue: { type: Number, default: 0 },
      debounce: { type: Boolean, default: false },
      debounceWait: { type: Number, default: 400 },
      icon: { type: String as PropType<keyof Unicons>, default: undefined },
      bgColor: { type: String, default: 'neutral-0' },
      name: { type: String, default: '', required: false },
      isDisabled: { type: true || false, default: false, required: false },
      min: { type: String, default: '', required: false },
      max: { type: String, default: '', required: false },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      let emitValue = (value: number) => emit('update:modelValue', value);
      if (props.debounce) {
        emitValue = debounce(emitValue, props.debounceWait);
      }
      const inputValue = computed({
        get() {
          return props.modelValue;
        },
        set(value: number) {
          emitValue(value);
        },
      });

      return { inputValue, inputStyle, inputContainerStyle, props };
    },
  });
</script>
