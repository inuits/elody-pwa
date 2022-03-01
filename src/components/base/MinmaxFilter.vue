<template>
  <div class="flex md:justify-around">
    <MinMaxField
      v-model="minValue"
      :debounce="true"
      placeholder="min"
      :bg-color="'neutral-20'"
      label="min"
      min="0"
    />
    <MinMaxField
      v-model="maxValue"
      :debounce="true"
      placeholder="max"
      :bg-color="'neutral-20'"
      label="max"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import MinMaxField from '@/components/base/MinMaxField.vue';

  export default defineComponent({
    name: 'MinmaxFilter',
    components: {
      MinMaxField,
    },
    props: {
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:minmaxValue'],
    setup(props, { emit }) {
      const returnObject = {
        key: props.filterkey,
        value: { min: 0, max: 0 },
      };
      const minValue = ref<number>(returnObject.value.min);
      const maxValue = ref<number>(returnObject.value.max);

      watch([minValue, maxValue], () => {
        if (minValue.value != undefined && maxValue) {
          minValue.value == maxValue.value ? minValue.value++ : null;
        }

        if (minValue.value != undefined || maxValue.value != undefined) {
          emit('update:minmaxValue', returnObject);
        } else {
          emit('update:minmaxValue', { key: props.filterkey, value: undefined });
        }
        /* let testvar = JSON.stringify(returnObject.value);
        console.log(testvar); */
      });

      return { minValue, maxValue };
    },
  });
</script>
