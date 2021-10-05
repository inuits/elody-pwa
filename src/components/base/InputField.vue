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
        :disabled="isDisabled"
        v-model="inputValue"
        v-bind="$attrs"
        :class="[`bg-${bgColor}`, inputStyle]"
        type="text"
        name=""
      />
    </div>
  </label>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
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
      modelValue: { type: String, default: '' },
      debounce: { type: Boolean, default: false },
      debounceWait: { type: Number, default: 400 },
      icon: { type: String as PropType<keyof Unicons>, default: undefined },
      bgColor: { type: String, default: 'neutral-0' },
      name: { type: String, default: '', required: false },
      isDisabled: { type: true || false, default: false, required: false },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const inputValue = ref<string>(props.modelValue);
      let emitValue = (value: string) => emit('update:modelValue', value);
      if (props.debounce) {
        emitValue = debounce(emitValue, props.debounceWait);
      }
      watch(inputValue, emitValue);
      return { inputValue, inputStyle, inputContainerStyle };
    },
  });
</script>
