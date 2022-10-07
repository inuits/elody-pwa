<template>
  <InputField
    v-if="type !== 'dropdown'"
    v-model="value"
    :label="label === undefined ? fieldKey : label"
    :is-disabled="active === false ? true : false"
  />
  <BaseDropdown
    v-else
    v-model="value"
    :label="label === undefined ? fieldKey : label"
    :options="stringifyOption(options)"
    :is-disabled="active === false ? true : false"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import InputField from "@/components/base/InputField.vue";
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import { useField } from "vee-validate";
import type { MetadataFieldOption } from "@/queries";

export default defineComponent({
  name: "MetaEditDataField",
  components: { InputField, BaseDropdown },
  props: {
    fieldKey: { type: String, required: true },
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    type: { type: String, required: false, default: "text" },
    options: {
      type: Array as PropType<MetadataFieldOption[]>,
      required: false,
      default: () => [],
    },
    active: { type: Boolean, required: false, default: true },
  },
  setup: (props) => {
    const { value } = useField<string>(props.fieldKey, {});

    const stringifyOption = (input: MetadataFieldOption[]) => {
      let returnArray: string[] = [];

      input.forEach((metaDataFieldObject: MetadataFieldOption) => {
        returnArray.push(metaDataFieldObject.value);
      });

      return returnArray;
    };

    return {
      value,
      stringifyOption,
    };
  },
});
</script>
