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
      filterkey: {
        type: [String],
        required: true,
        default: undefined,
      },
    },
    emits: ['update:listValue'],
    setup(props, { emit }) {
      const options = ['a', 'b', 'c', 'd', 'e', 'f'];
      const checklistValue = ref([]);
      const returnObject = ref();

      watch(checklistValue.value, () => {
        let temp = [];
        for (let i = 0; i < checklistValue.value.length; i++) {
          if (checklistValue.value[i] == true) {
            temp.push(options[i]);
          }
        }

        if (temp.length > 0) {
          returnObject.value = { key: props.filterkey, value: temp };
        } else {
          returnObject.value = undefined;
        }
      });

      let emitValue = (value: object) => emit('update:listValue', value);
      watch(returnObject, emitValue);
      return { checklistValue, options };
    },
  });
</script>
