<template>
  <label class="block">
    <span class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
    <select v-model="selectedItem" class="select">
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
      selected: { type: String, default: undefined },
    },
    emits: ['update:selected'],
    setup(props, { emit }) {
      const selectedItem = ref(props.selected);
      watch(selectedItem, (value) => emit('update:selected', value));
      return { Unicons, selectedItem };
    },
  });
</script>
<style lang="postcss" scoped>
  .select {
    @apply block mr-4 p-2 w-48 min-w-0;
    @apply border border-neutral-30;
    @apply text-neutral-700 text-sm;
    @apply rounded bg-neutral-20;
    @apply focus:outline-none;
  }
  .select option {
    @apply rounded py-2 px-4 bg-neutral-20 h-9;
  }
</style>
