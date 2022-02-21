<template>
  <div>
    <Multiselect
      v-model="value"
      mode="tags"
      searchable="true"
      :close-on-select="false"
      :options="options"
      label="label"
      track-by="label"
      value-prop="label"
      placeholder="choose your filters"
      no-results-text="no filter with that name found"
      loading="true"
      class="multiselect-blue"
    />
  </div>
</template>

<script lang="ts">
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import Multiselect from '@vueform/multiselect';
  import { ref, defineComponent } from 'vue';

  export default defineComponent({
    components: {
      Multiselect,
    },
    props: {
      filterkey: {
        type: [String],
        required: true,
        default: undefined,
      },
    },
    setup(props) {
      const value = ref();
      const { result, onResult } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });
      console.log('multiiiiii');
      console.log(result.value);
      const options = result.value?.FilterOptions;
      console.log('optieeeeee');
      console.log(options);

      return { result, value, options };
    },
  });
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
