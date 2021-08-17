<template>
  <label class="block my-2">
    <span v-if="label" class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
    <div class="flex flex-row border border-neutral-30 rounded mr-4">
      <unicon
        :name="Unicons.SearchGlass.name"
        class="h-full bg-neutral-20 pl-2"
        fill="var(--text-neutral-20)"
      />

      <input
        v-model="inputValue"
        v-bind="$attrs"
        class="
          py-2
          pl-4
          w-48
          min-w-0
          text-neutral-700 text-sm
          bg-neutral-20
          focus:outline-none
        "
        type="text"
      />
    </div>
  </label>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Unicons } from '@/types';
  import { debounce } from 'ts-debounce';

  export default defineComponent({
    name: 'InputField',
    inheritAttrs: false,
    props: {
      label: { type: String, default: '' },
      modelValue: { type: String, default: '' },
      debounce: { type: Boolean, default: false },
      debounceWait: { type: Number, default: 400 },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const inputValue = ref<string>(props.modelValue);
      let emitValue = (value: string) => emit('update:modelValue', value);
      if (props.debounce) {
        emitValue = debounce(emitValue, props.debounceWait);
      }
      watch(inputValue, emitValue);
      return { Unicons, inputValue };
    },
  });
</script>
