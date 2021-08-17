<template>
  <label class="block">
    <span class="ml-1 text-neutral-700 text-sm font-base">{{ props.label }}</span>
    <select
      class="
        h-9
        block
        mr-4
        py-2
        pl-4
        w-48
        min-w-0
        border-2 border-neutral-40 border-opacity-25
        font-base
        text-neutral-700 text-sm
        rounded
        bg-neutral-20
        focus:border-white focus:outline-none
      "
      @click="toggleMenu"
    >
      <option
        v-for="option in options"
        :key="option"
        class="font-base rounded py-2 px-4 bg-neutral-20 h-9"
        value="option"
        :selected="option === props.selected ? true : false"
        @click="setSelectedItem(option)"
      >
        {{ option }}
      </option>
    </select>
  </label>
</template>
<script lang="ts">
  import { defineComponent, PropType, reactive } from 'vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'Dropdown',
    props: {
      label: {
        type: String,
        required: false,
        default: '',
      },
      options: {
        type: Array as PropType<String[]>,
        required: true,
        default: undefined,
      },
      selected: {
        type: String,
        required: false,
        default: undefined,
      },
    },
    emits: ['update:selected'],
    setup(props, { emit }) {
      const state = reactive({
        isOpen: false,
        options: props.options,
        selected: '4',
      });

      function toggleMenu() {
        state.isOpen = !state.isOpen;
      }

      function setSelectedItem(option: string) {
        state.selected = option;
        emit('update:selected', state.selected);
        toggleMenu;
      }

      return { Unicons, state, props, toggleMenu, setSelectedItem };
    },
  });
</script>
