<template>
  <div>
    <InputField
      v-model="minValue"
      :debounce="true"
      placeholder="min"
      :bg-color="'neutral-20'"
    />
    <InputField
      v-model="maxValue"
      :debounce="true"
      placeholder="max"
      :bg-color="'neutral-20'"
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
    emits: ['update:minmaxValue'],
    setup(props, { emit }) {
      const minValue = ref('');
      const maxValue = ref('');
      const minmaxValue = ref<object>({});
      watch([minValue, maxValue], () => {
        minmaxValue.value = {
          key: 'minmax',
          value: { min: minValue.value, max: maxValue.value },
        };
      });
      let emitValue = (value: object) => emit('update:minmaxValue', value);
      watch(minmaxValue, emitValue);
      return { minValue, maxValue };
    },
  });
</script>
