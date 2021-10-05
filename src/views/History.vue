<template>
    <ParentJob :jobs="jobs"/>
    <ParentJob :jobs="jobs"/>
    <ParentJob :jobs="jobs"/>
</template>

<script lang="ts">
import { GetJobsDocument } from '@/queries';
import { useQuery } from '@vue/apollo-composable';
import { computed, defineComponent } from 'vue';
import ParentJob from '@/components/ParentJob.vue';

export default defineComponent({
  name: "History",
  components: { ParentJob },
  setup() {
    const { result } = useQuery(GetJobsDocument, {limit: 2});
    console.log(result);
    return {
      jobs: computed( () => {return result.value?.Jobs?.results;}),
    };
  },
});
</script>
