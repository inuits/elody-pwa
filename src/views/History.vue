<template>
  <div>
    <div class="flex flex-row gap-y-4 items-center">
      <Dropdown v-model="queryVariables.pagination.limit" :options="[5, 10, 15, 20]" />
      <Pagination
        v-if="jobs.count > 0"
        v-model:skip="queryVariables.pagination.skip"
        :limit="queryVariables.pagination.limit"
        :total-items="jobs.count"
      />
    </div>
    <div v-for="job in jobs.results" :key="job.job_key">
      <ParentJob :job="job" />
    </div>
  </div>
</template>

<script lang="ts">
import { GetJobsDocument } from '@/queries';
import { useQuery } from '@vue/apollo-composable';
import { computed, defineComponent, ref, watch, reactive } from 'vue';
import ParentJob from '@/components/ParentJob.vue';
import Dropdown from '@/components/base/Dropdown.vue';
import Pagination, { PaginationInfo } from '@/components/base/Pagination.vue';

type QueryVariables = {
  pagination: PaginationInfo;
  searchQuery: string;
};

export default defineComponent({
  name: 'History',
  components: { ParentJob, Dropdown, Pagination },
  setup() {
    const limit = ref(5);
    const searchQuery = ref('');
    const queryVariables = reactive<QueryVariables>({
      pagination: {
        limit: limit.value,
        skip: 0,
      },
      searchQuery: searchQuery.value,
    });

    const { result, fetchMore } = useQuery(GetJobsDocument, {
      paginationInfo: {
        limit: queryVariables.pagination.limit,
        skip: queryVariables.pagination.skip,
      },
    });

    watch(queryVariables, () => {
      fetchMore({
        variables: {
          paginationInfo: {
            limit: queryVariables.pagination.limit,
            skip: queryVariables.pagination.skip,
          },
        },
        updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
      });
    });

    return {
      jobs: computed(() => {
        return result.value?.Jobs;
      }),
      result,
      limit,
      searchQuery,
      queryVariables,
    };
  },
});
</script>
