<template>
  <label class="block my-2">
    <span v-if="label" class="font-base ml-1 text-neutral-700 text-sm">{{
      label
    }}</span>
    <div class="flex flex-row">
      <unicon
        :name="Unicons.SearchGlas.name"
        class="
          h-full
          bg-neutral-20
          rounded-l
          pl-2
          border-t-2 border-b-2 border-l-2 border-neutral-40 border-opacity-25
        "
        fill="var(--text-neutral-20)"
      />

      <input
        v-model="inputValue"
        class="
          mr-4
          py-2
          pl-4
          w-48
          min-w-0
          text-neutral-700 text-sm
          font-base
          rounded-r
          bg-neutral-20
          border-t-2 border-b-2 border-r-2 border-neutral-40 border-opacity-25
          focus:outline-none
        "
        type="text"
        :placeholder="placeholder"
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
    props: {
      placeholder: {
        type: String,
        require: false,
        default: '',
      },
      label: {
        type: String,
        require: false,
        default: '',
      },
      modelValue: {
        type: String,
        required: false,
        default: '',
      },
      debounce: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const inputValue = ref<string>(props.modelValue);
      const debounceInput = debounce(() => {}, 400);
      function sendInputValue(value: string) {
        emit('update:modelValue', value);
      }
      watch(inputValue, (value: string) => {
        if (props.debounce) {
          debounceInput().then(() => sendInputValue(value));
        } else sendInputValue(value);
      });
      return { Unicons, inputValue, debounceInput, sendInputValue };
    },
  });
</script>
