<template>
  <InputField
    v-if="type !== 'dropdown'"
    v-model="value"
    :label="label ? label : fieldKey"
    :is-disabled="active === false ? true : false"
  />
  <!-- :label="label === undefined ? fieldKey : label" -->
  <BaseDropdown
    v-else
    v-model="value"
    :label="label ? label : fieldKey"
    :options="stringifyOption(options)"
    :is-disabled="active === false ? true : false"
  />
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import type { PropType } from "vue";
import InputField from "@/components/base/InputField.vue";
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import { useField } from "vee-validate";
import type { InputFieldTypes, Maybe, MetadataFieldOption } from '@/queries';
export default defineComponent({
  name: "MetaEditDataField",
  components: { InputField, BaseDropdown },
  props: {
    fieldKey: { type: Object as PropType<InputFieldTypes | string>, required: true },
    label: {
      type: Object as PropType<Maybe<string | undefined>>,
      required: false,
      default: undefined,
    },
    type: { type: String, required: false, default: "text" },
    options: {
      type: Object as PropType<Maybe<Maybe<MetadataFieldOption>[]> | undefined>,
      required: false,
      default: () => [],
    },
    active: {
      type: Boolean,
      default: () => true
    },
  },
  emits: ["onChange"],
  setup: ({ fieldKey}, { emit }) => {
    const { value } = useField<string>(fieldKey, {});

    const stringifyOption = (input: Maybe<Maybe<MetadataFieldOption>[]> | undefined) => {
      let returnArray: string[] = [];
      if (input) {
        input.forEach((metaDataFieldObject: Maybe<MetadataFieldOption>) => {
          if (metaDataFieldObject) {
            returnArray.push(metaDataFieldObject.value);
          }
        });
      }
      return returnArray;
    };

    watch(value, () => {
      emit('onChange', true);
    });


    return {
      value,
      stringifyOption,
    };
  },
});
</script>
