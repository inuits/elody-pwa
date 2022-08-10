<template>
  <InputField
    v-if="type !== 'dropdown'"
    v-model="value"
    :label="label === undefined ? fieldKey : label"
  />
  <Dropdown
    v-else
    v-model="value"
    :label="label === undefined ? fieldKey : label"
    :options="stringifyOption(options)"
  />
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import { useField } from 'vee-validate';
  import { MetadataFieldOption } from '@/queries';

  export default defineComponent({
    name: 'MetaEditDataField',
    components: { InputField, Dropdown },
    props: {
      fieldKey: { type: String, required: true },
      label: {
        type: String,
        required: false,
        default: undefined,
      },
      type: { type: String, required: false, default: 'text' },
      options: { type: Array, required: false, default: () => [] },
    },
    setup: (props) => {
      const { value } = useField<string>(props.fieldKey, {});
      const inputType = ref<string>('text');

      const stringifyOption = (input: MetadataFieldOption[]) => {
        let returnArray: string[] = [];

        input.forEach((metaDataFieldObject: MetadataFieldOption) => {
          returnArray.push(metaDataFieldObject.value);
        });

        return returnArray;
      };

      const setInputType = () => {
        switch (props.type) {
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
        inputType,
        stringifyOption,
      };
    },
  });
</script>
