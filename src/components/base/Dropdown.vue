<template>
  <label class="block">
    <span class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
    <select v-model="selectedItem">
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'Dropdown',
    props: {
      label: { type: String, default: '' },
      options: { type: Array, required: true },
      modelValue: { type: String, default: undefined },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const selectedItem = ref(props.modelValue);
      watch(selectedItem, (value) => emit('update:modelValue', value));
      return { Unicons, selectedItem };
    },
  });
</script>

<style lang="postcss" scoped>
  select {
    @apply block mr-4 p-2 w-48 min-w-0;
    @apply border border-neutral-30;
    @apply text-neutral-700 text-sm;
    @apply rounded bg-neutral-20;
    @apply focus:outline-none;
  }
  option {
    @apply rounded py-2 px-4 bg-neutral-20 h-9;
  }
</style>
