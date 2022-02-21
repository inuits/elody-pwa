<template>
  <div>
    <ul v-for="(option, index) in result.FilterOptions" :key="option">
      <li>
        <input
          :id="option.label"
          v-model="checklistValue[index]"
          type="checkbox"
          :name="option.label"
          :value="option.value"
        />
        <label
          :for="option.label"
          class="ml-2 align-center p-10px cursor-pointer display-inline-block"
        >
          {{ option.label.charAt(0).toUpperCase() + option.label.slice(1) }}</label
        >
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
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
      const checklistValue = ref([]);
      const returnObject = ref();

      const { result, onResult } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });
      console.log(result.value);

      const options = ['a'];

      watch(checklistValue, () => {
        let temp = [];
        for (let i = 0; i < checklistValue.value.length; i++) {
          if (checklistValue.value[i] == true) {
            temp.push(options[i]);
            console.log('checklistvaluetester');
            console.log(checklistValue.value[i]);
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
      return { result, checklistValue, options };
    },
  });
</script>
