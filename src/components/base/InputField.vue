<template>
  <div class="relative flex flex-wrap mb-3">
    <span
      class="
        z-10
        h-full
        leading-snug
        font-normal
        absolute
        text-center text-blueGray-300
        absolute
        bg-gray
        rounded
        text-base
        items-center
        justify-center
        w-8
        pl-3
        py-3
      "
    >
      <unicon
        :name="Unicons.SearchGlas.name"
        height="20"
        fill="var(--colors-neutral-700)"
      />
    </span>
    <input
      v-model="inputValue"
      class="
        px-3
        py-3
        placeholder-blueGray-300
        text-blueGray-600
        relative
        bg-white
        rounded
        text-sm
        border border-blueGray-300
        outline-none
        focus:outline-none focus:ring
        pl-10
      "
      type="text"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Unicons } from '@/types';
  // import _ from 'lodash';

  export default defineComponent({
    name: 'InputField',
    props: {
      placeholder: {
        type: String,
        require: false,
        default: 'Search',
      },
      modelValue: {
        type: String,
        required: false,
        default: 'asset',
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
      const emitValues = (input: any) => {
        console.log("INPUT");
        console.log(input);
        emit('update:modelValue', input);
      };

      const debounceInput = (event: any) => {
        console.log('DEBOUNCE');
        emitValues(event);
        // if (props.debounce) {
        //   _.debounce(() => {
        //     emitValues;
        //   }, 500);
        // } else {
        // emitValues(event.target.value);
        // }
      };

      watch(inputValue, (value: any) => {
        emit('update:modelValue', value);
      });

      return { Unicons, props, debounceInput, emitValues, inputValue };
    },
  });
</script>
