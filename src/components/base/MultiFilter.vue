<template>
  <div class="mb-1 flex">
    <AndOrToggle
      v-model:AndOrValue="MultiFuzzyKeuze"
      texton="Multi"
      textoff="Fuzzy"
      class="mr-1"
    />
    <AndOrToggle
      v-if="MultiFuzzyKeuze == true"
      v-model:AndOrValue="EnOfKeuze"
      texton="En"
      textoff="Of"
    />
  </div>
  <div></div>
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
  import AndOrToggle from './AndOrToggle.vue';

  export default defineComponent({
    name: 'MultiFilter',
    components: {
      Multiselect,
      AndOrToggle,
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
        AndOrValue: String;
        MultiFuzzyChoice: String;
      };

      const MultiSelectValue = ref<string[]>([]);
      const returnObject = ref<returnType>();

      const EnOfKeuze = ref<boolean>(true);
      const MultiFuzzyKeuze = ref<boolean>(true);

      watch([MultiSelectValue, MultiFuzzyKeuze, EnOfKeuze], () => {
        if (MultiSelectValue.value.length > 0) {
          returnObject.value = {
            key: props.filterkey,
            value: MultiSelectValue.value,
            MultiFuzzyChoice: MultiFuzzyKeuze.value == true ? 'Multi' : 'Fuzzy',
            AndOrValue: EnOfKeuze.value == true ? 'En' : 'Of',
          };
        } else {
          returnObject.value = {
            key: props.filterkey,
            value: undefined,
            MultiFuzzyChoice: MultiFuzzyKeuze.value == true ? 'Multi' : 'Fuzzy',
            AndOrValue: EnOfKeuze.value == true ? 'En' : 'Of',
          };
        }
        /*  let testvar = JSON.stringify(returnObject.value);
        console.log(testvar); */
      });

      const { result, onResult } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });
      let emitValue = (value: object) => emit('update:MultiselectValue', value);

      watch(returnObject, emitValue);

      return { result, MultiSelectValue, MultiFuzzyKeuze, EnOfKeuze };
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
