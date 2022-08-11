<template>
  <InputField
    v-if="field.type !== 'dropdown'"
    v-model="value"
    :label="field.label === undefined ? field.key : field.label"
    :isDisabled="field.active === false ? true : false"
  />
  <Dropdown
    v-else
    v-model="value"
    :label="field.label === undefined ? field.key : field.label"
    :options="stringifyOption(field.options)"
    :isDisabled="field.active === false ? true : false"
  />
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import { useField } from 'vee-validate';
  import { MetadataField, MetadataFieldOption } from '@/queries';

  export default defineComponent({
    name: 'MetaEditDataField',
    components: { InputField, Dropdown },
    props: {
      field: {
        type: Object as PropType<MetadataField>,
        required: true,
      },
    },
    setup: (props) => {
      const { value } = useField<string>(props.field.key, {});
      const inputType = ref<string>('text');

      const stringifyOption = (input: MetadataFieldOption[]) => {
        let returnArray: string[] = [];

        input.forEach((metaDataFieldObject: MetadataFieldOption) => {
          returnArray.push(metaDataFieldObject.value);
        });

        return returnArray;
      };

      const setInputType = () => {
        switch (props.field.type) {
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
