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
      const minValue = ref('');
      const maxValue = ref('');
      const minmaxValue = ref();
      watch([minValue, maxValue], () => {
        if (minValue.value != '' || maxValue.value != '') {
          minmaxValue.value = {
            key: props.filterkey,
            value: { min: minValue.value, max: maxValue.value },
          };
        } else {
          minmaxValue.value = undefined;
        }
      });
      let emitValue = (value: object) => emit('update:minmaxValue', value);
      watch(minmaxValue, emitValue);
      return { minValue, maxValue };
    },
  });
</script>
