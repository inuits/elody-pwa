<template>
  <label class="block text-sm text-gray-700 ml-3">{{ props.label }}</label>
  <div class="block flex justify-center ml-3">
    <select class="w-48 rounded h-12" @click="toggleMenu">
      <option
        v-for="option in options"
        :key="option"
        value="option"
        :selected="option === props.selected ? true : false"
        @click="setSelectedItem(option)"
      >
        {{ option }}
      </option>
    </select>
  </div>
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
