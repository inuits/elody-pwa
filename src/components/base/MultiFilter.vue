<template>
  <div>
    <Multiselect
      v-model="MultiSelectValue"
      mode="tags"
      :searchable="true"
      :close-on-select="false"
      :options="result?.FilterOptions"
      label="label"
      track-by="label"
      value-prop="label"
      placeholder="choose your filters"
      no-results-text="no filter with that name found"
    />
  </div>
</template>

<script lang="ts">
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { ref, defineComponent, watch } from 'vue';
  import Multiselect from '@vueform/multiselect';

  export default defineComponent({
    name: 'MultiFilter',
    components: {
      Multiselect,
    },
    props: {
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:MultiselectValue'],
    setup(props, { emit }) {
      type returnType = {
        key: string;
        value: string[] | undefined;
      };

      const MultiSelectValue = ref<string[]>([]);
      const returnObject = ref<returnType>();

      watch(MultiSelectValue, () => {
        if (MultiSelectValue.value.length > 0) {
          returnObject.value = { key: props.filterkey, value: MultiSelectValue.value };
        } else {
          returnObject.value = { key: props.filterkey, value: undefined };
        }
      });

      const { result, onResult } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });
      let emitValue = (value: object) => emit('update:MultiselectValue', value);

      watch(returnObject, emitValue);
      return { result, MultiSelectValue };
    },
  });
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
  :root {
    --ms-tag-bg: #0052cc;
    --ms-ring-color: white;
  }
</style>
