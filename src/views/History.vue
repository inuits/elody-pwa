<template>
  <div class="bg-neutral-20 h-full px-6 py-4">
    <div v-for="job in jobs" :key="job.job_id">
      <Job :job="job" />
    </div>
   
  </div>
  
</template>

<script lang="ts">
import { GetJobsDocument } from '@/queries';
import { useQuery } from '@vue/apollo-composable';
import { computed, defineComponent } from 'vue';
import Job from '@/components/Job.vue';



export default defineComponent({
  name: "History",
  components: { Job },
  setup() {
    const { result } = useQuery(GetJobsDocument);
    console.log(result);
    return {
      jobs: computed( () => {return result.value?.Jobs?.results;}),
    };
  },
});
</script>
