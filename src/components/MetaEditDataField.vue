<template>
  <InputField
    v-if="type !== 'dropdown'"
    v-model="value"
    :label="label ? label : fieldKey"
    :is-disabled="active === false ? true : false"
    :type="type"
  />
  <!-- :label="label === undefined ? fieldKey : label" -->
  <BaseDropdown
    v-if="type === 'dropdown'"
    v-model="value"
    :label="label ? label : fieldKey"
    :options="stringifyOption(options)"
    :is-disabled="active === false ? true : false"
  />
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import type { PropType } from "vue";
import InputField from "./base/InputField.vue";
import BaseDropdown from "./base/BaseDropdown.vue";
import { useField } from "vee-validate";
import type { InputFieldTypes, Maybe, MetadataFieldOption } from "../queries";
export default defineComponent({
  name: "MetaEditDataField",
  components: { InputField, BaseDropdown },
  props: {
    fieldKey: {
      type: String as PropType<InputFieldTypes | string>,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    type: { type: String, required: false, default: "text" },
    options: {
      type: Array as PropType<Maybe<Maybe<MetadataFieldOption>[]> | undefined>,
      required: false,
      default: () => [],
    },
    active: {
      type: Boolean as PropType<Maybe<Boolean> | undefined | null>,
      default: true,
    },
  },
  emits: ["onChange"],
  setup: (props, { emit }) => {
    const { value } = useField<string>(props.fieldKey, {});

    const stringifyOption = (
      input: Maybe<Maybe<MetadataFieldOption>[]> | undefined
    ) => {
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
      emit("onChange", true);
    });

    return {
      value,
      stringifyOption,
    };
  },
});
</script>
