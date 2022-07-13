<template>
  <InputField v-model="value" :label="label === undefined ? fieldKey : label" :type="inputType" />
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  import { useField } from 'vee-validate';

  export default defineComponent({
    name: 'MetaEditDataField',
    components: { InputField },
    props: {
      fieldKey: { type: String, required: true },
      label: {
        type: String,
        required: false,
        default: undefined,
      },
      type: { type: String, required: false, default: 'text'}
    },
    setup: (props) => {
      const { value } = useField<string>(props.fieldKey, {});
      const inputType = ref<string>('text');

      const setInputType = () => {
        switch(props.type) { 
          case 'text': {
            inputType.value = 'text';
            break;
          }
          case 'boolean': {
            inputType.value = 'checkbox';
            break;
          }
          default: {
            inputType.value = 'text';
            break;
          } 
        } 
      };

      setInputType();

      return {
        value,
        inputType
      };
    },
  });
</script>
