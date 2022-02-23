<template>
  <div class="flex md:justify-around">
    <InputField
      v-model="minValue"
      :debounce="true"
      placeholder="min"
      :bg-color="'neutral-20'"
      label="min"
    />
    <InputField
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

  export default defineComponent({
    name: 'MinmaxFilter',
    components: {
      InputField,
    },
    props: {
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:minmaxValue'],
    setup(props, { emit }) {
      type returnObjectValue = {
        min: string;
        max: string;
      };

      type returnObject = {
        key: string;
        value: returnObjectValue | undefined;
      };

      const minValue = ref<string>('');
      const maxValue = ref<string>('');
      const returnObject = ref<returnObject>();

      watch([minValue, maxValue], () => {
        if (minValue.value != '' || maxValue.value != '') {
          returnObject.value = {
            key: props.filterkey,
            value: { min: minValue.value, max: maxValue.value },
          };
        } else {
          returnObject.value = { key: props.filterkey, value: undefined };
        }
      });

      let emitValue = (value: object) => emit('update:minmaxValue', value);
      watch(returnObject, emitValue);

      return { minValue, maxValue };
    },
  });
</script>
