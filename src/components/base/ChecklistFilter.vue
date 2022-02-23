<template>
  <div>
    <ul v-for="(option, index) in options?.FilterOptions" :key="option">
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
      },
    },
    emits: ['update:listValue'],
    setup(props, { emit }) {
      const checklistValue = ref<Boolean[]>([]);
      const returnObject = ref<object>();

      const { result: options } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      watch(checklistValue.value, () => {
        let temp = [];
        if (options.value?.FilterOptions) {
          for (let i = 0; i < checklistValue.value.length; i++) {
            if (checklistValue.value[i] == true) {
              temp.push(options.value.FilterOptions[i]);
            }
          }
        }

        if (temp.length > 0) {
          returnObject.value = { key: props.filterkey, value: temp };
        } else {
          returnObject.value = { key: props.filterkey, value: undefined };
        }
      });

      let emitValue = (value: object) => emit('update:listValue', value);
      watch(returnObject, emitValue);

      return { options, checklistValue };
    },
  });
</script>
