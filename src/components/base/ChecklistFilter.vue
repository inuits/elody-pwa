<template>
  <div>
    <ul v-for="(option, index) in options" :key="option">
      <li>
        <input
          :id="option"
          v-model="checklistValue[index]"
          type="checkbox"
          :name="option"
          :value="option"
        />
        <label
          :for="option"
          class="ml-2 align-center p-10px cursor-pointer display-inline-block"
        >
          {{ option.charAt(0).toUpperCase() + option.slice(1) }}</label
        >
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';

  export default defineComponent({
    name: 'ChecklistFilter',
    props: {
      options: {
        type: [String],
        required: false,
        default: undefined,
      },
    },
    emits: ['update:checklistValue'],
    setup(props, { emit }) {
      const checklistValue = ref([]);
      const checklistObject = ref<object>({});
      watch(checklistValue, () => {
        checklistObject.value = {
          key: 'checklist',
          value: checklistObject.value,
        };
        console.log(checklistValue.value);
        console.log(checklistObject.value);
      });
      let emitValue = (value: object) => emit('update:checklistValue', value);
      watch(checklistObject, emitValue);
      return { checklistValue };
    },
  });
</script>
