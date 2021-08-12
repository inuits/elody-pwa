<template>
  <label
    v-if="props.label.length > 0"
    class="block mb-1 text-sm text-gray-700"
    >{{ props.label }}</label
  >
  <div class="block flex flex-wrap mb-3">
    <span
      class="
        z-10
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
  import { debounce } from 'ts-debounce';

  export default defineComponent({
    name: 'InputField',
    props: {
      placeholder: {
        type: String,
        require: false,
        default: 'Search Asset Library...',
      },
      label: {
        type: String,
        require: false,
        default: '',
      },
      search: {
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
    emits: ['update:search'],
    setup(props, { emit }) {
      const inputValue = ref<string>(props.search);

      function sendInputValue(value: string) {
        emit('update:search', value);
      }

      const debounceInput = debounce(() => {}, 400);

      watch(inputValue, (value: string) => {
        if (props.debounce) {
          debounceInput().then(() => {
            sendInputValue(value);
          });
        } else sendInputValue(value);
      });

      return { Unicons, props, inputValue };
    },
  });
</script>
