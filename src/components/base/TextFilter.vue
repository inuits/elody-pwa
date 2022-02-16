<template>
  <div>
    <InputField
      v-model="inputValue"
      :debounce="true"
      :placeholder="text"
      :bg-color="'neutral-20'"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  export default defineComponent({
    name: 'TextFilter',
    components: {
      InputField,
    },
    props: {
      text: {
        type: [String],
        required: false,
        default: '',
      },
    },
    emits: ['update:inputValue'],
    setup(props, { emit }) {
      const inputValue = ref<string>('');
      let emitValue = (value: string) => emit('update:inputValue', value);
      watch(inputValue, emitValue);
      return { inputValue };
    },
  });
</script>
