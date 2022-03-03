<template>
  <div class="mb-1 flex">
    <AndOrToggle
      v-model:AndOrValue="returnObject.MultiFuzzyChoice"
      texton="Multi"
      textoff="Fuzzy"
      class="mr-1"
    />
    <AndOrToggle
      v-if="returnObject.MultiFuzzyChoice == true"
      v-model:AndOrValue="returnObject.AndOrValue"
      texton="En"
      textoff="Of"
    />
  </div>

  <div>
    <Multiselect
      v-if="returnObject.MultiFuzzyChoice == true"
      v-model="multiValue"
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
  <div>
    <InputField
      v-if="returnObject.MultiFuzzyChoice == false"
      v-model="fuzzyValue"
      :debounce="true"
      placeholder="Fuzzy Search..."
      :bg-color="'neutral-20'"
    />
  </div>
</template>

<script lang="ts">
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { ref, defineComponent, watch } from 'vue';
  import Multiselect from '@vueform/multiselect';
  import AndOrToggle from './AndOrToggle.vue';
  import InputField from '@/components/base/InputField.vue';

  export default defineComponent({
    name: 'MultiFilter',
    components: {
      Multiselect,
      AndOrToggle,
      InputField,
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
        value: string[] | String | undefined;
        AndOrValue: Boolean | String;
        MultiFuzzyChoice: Boolean | String;
      };

      const returnObject = ref<returnType>({
        key: props.filterkey,
        value: undefined,
        AndOrValue: true,
        MultiFuzzyChoice: true,
      });

      const multiValue = ref<string[]>([]);
      const fuzzyValue = ref<string>('');

      watch(returnObject.value, () => {
        returnObject.value.value === undefined
          ? ((multiValue.value = []), (fuzzyValue.value = ''))
          : null;

        emit('update:MultiselectValue', returnObject.value);
      });

      watch(multiValue, () => {
        returnObject.value.MultiFuzzyChoice
          ? (returnObject.value.value = multiValue.value)
          : null;
      });

      watch(fuzzyValue, () => {
        (fuzzyValue.value === '' || fuzzyValue.value === undefined) && !returnObject.value.MultiFuzzyChoice
          ? returnObject.value.value = undefined
          : (returnObject.value.value = fuzzyValue.value);
      });

      const { result, onResult } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      return { result, returnObject, multiValue, fuzzyValue };
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
