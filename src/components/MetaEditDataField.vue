<template>
  <InputField  v-model="value" :label="label === undefined ? fieldKey : label" />
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
    },
    setup: (props) => {
      const { value } = useField<string>(props.fieldKey);

      

      return {
        value,
      };
    },
  });
</script>
