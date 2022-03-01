<template>
  <div><AndOrToggle v-model:AndOrValue="EnOfKeuze" texton="En" textoff="Of" /></div>
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
  import AndOrToggle from './AndOrToggle.vue';
  export default defineComponent({
    name: 'ChecklistFilter',
    components: { AndOrToggle },
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
      const EnOfKeuze = ref<boolean>(true);
      const { result: options } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      watch([checklistValue.value, EnOfKeuze], () => {
        let temp = [];
        if (options.value?.FilterOptions) {
          for (let i = 0; i < checklistValue.value.length; i++) {
            if (checklistValue.value[i] == true) {
              temp.push(options.value.FilterOptions[i]?.value);
            }
          }
        }

        if (temp.length > 0) {
          returnObject.value = {
            key: props.filterkey,
            value: temp,
            AndOrValue: EnOfKeuze.value == true ? 'En' : 'Of',
          };
        } else {
          returnObject.value = {
            key: props.filterkey,
            value: undefined,
            AndOrValue: EnOfKeuze.value == true ? 'En' : 'Of',
          };
        }
        /* let testvar = JSON.stringify(returnObject.value);
        console.log(testvar); */
      });
      watch(EnOfKeuze, () => {
        console.log('boollog checkfilter', EnOfKeuze.value);
      });

      let emitValue = (value: object) => emit('update:listValue', value);
      watch(returnObject, emitValue);

      return { options, checklistValue, EnOfKeuze };
    },
  });
</script>
