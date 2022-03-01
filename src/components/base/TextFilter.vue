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
  import { defineComponent, ref, watch, watchEffect } from 'vue';
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

      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:inputValue'],
    setup(props, { emit }) {
      type returnObject = {
        key: string;
        value: string | undefined;
      };

      const inputValue = ref<string>('');

      const returnObject = ref<returnObject>();

      watch(inputValue, () => {
        if (inputValue.value != '' && inputValue.value != undefined) {
          returnObject.value = { key: props.filterkey, value: inputValue.value };
        } else {
          returnObject.value = { key: props.filterkey, value: undefined };
        }
        /*  let testvar = JSON.stringify(returnObject.value);
        console.log(testvar); */
      });

      let emitValue = (value: object) => emit('update:inputValue', value);
      watch(returnObject, emitValue);

      return { inputValue };
    },
  });
</script>
