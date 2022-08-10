<template>
  <div class="w-full my-2" v-if="inputType == 'dropdown'">
    <label class="label" :for="field.key">{{ field.label }}</label>
    <select v-model="value" class="w-full" :name="field.key" :id="field.key">
      <option
        class="value"
        v-for="option in field.options"
        :key="option.label"
        :value="option.label"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
  <div class="w-full" v-else>
    <InputField
      v-model="value"
      :label="field.label || field.key"
      :type="field.type"
      :placeholder="currentValue.value"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, Prop, watch } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  import { useField } from 'vee-validate';
  import { MetadataAndRelation, MetadataField } from '@/queries';

  export default defineComponent({
    name: 'MetaEditDataField',
    components: { InputField },
    props: {
      field: {
        type: Object as PropType<MetadataField>,
        required: true,
      },
      currentValue: {
        type: Object as PropType<MetadataAndRelation>,
        required: true,
      },
    },
    setup: (props) => {
      const { value } = useField<string>(props.field.key, {});
      const inputType = ref<string>('text');

      const setInputType = () => {
        value.value = props.currentValue.value;
        switch (props.field.type) {
          case 'text': {
            inputType.value = 'text';
            break;
          }
          case 'boolean': {
            inputType.value = 'checkbox';
            break;
          }
          case 'dropdown': {
            inputType.value = 'dropdown';
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
      };
    },
  });
</script>
<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }

  .metainfo {
    bottom: 1rem;
  }
</style>
