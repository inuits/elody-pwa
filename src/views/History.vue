<template>
  <div class="p-6">
    <div class="flex flex-row gap-y-4 items-center">
      <InputField
        v-model="searchQuery"
        :debounce="true"
        placeholder="Search History"
        label=""
        :bg-color="'neutral-20'"
      />
      <div class="pl-4 my-2 flex flex-row justify-left">
        <Dropdown v-model="queryVariables.pagination.limit" :options="[5, 10, 15, 20]" />
      </div>
      <div class="flex-grow"></div>
      <Pagination
        v-if="jobs.count > 0"
        v-model:skip="queryVariables.pagination.skip"
        v-model:limit="queryVariables.pagination.limit"
        :total-items="jobs.count"
      />
    </div>
    <div v-if="jobs.results">
      <div v-for="job in jobs.results" :key="job.job_key">
        <ParentJob :job="job" :subjobs="jobs.results" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { GetJobsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { computed, defineComponent, ref, watch, reactive } from 'vue';
  import ParentJob from '@/components/ParentJob.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import InputField from '@/components/base/InputField.vue';

  import Pagination, { PaginationInfo } from '@/components/base/Pagination.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';

  type Filter = {
    query: string;
    sort?: string;
  };

  type QueryVariables = {
    pagination: PaginationInfo;
    filters: Filter;
  };

  export default defineComponent({
    name: 'History',
    components: { ParentJob, Dropdown, Pagination, InputField },
    setup() {
      const limit = ref(5);
      const searchQuery = ref('');
      const queryVariables = reactive<QueryVariables>({
        pagination: {
          limit: 5,
          skip: 1,
        },
        filters: {
          query: searchQuery.value,
        },
      });
      const helper = useRouteHelpers();
      queryVariables.pagination = helper.getPaginationInfoFromUrl(
        queryVariables.pagination,
      ) as PaginationInfo;

      const { result, fetchMore } = useQuery(GetJobsDocument, {
        paginationInfo: {
          limit: queryVariables.pagination.limit,
          skip: queryVariables.pagination.skip,
        },
        filters: {
          query: queryVariables.filters.query,
        },
      });

      watch(queryVariables, () => {
        helper.updatePaginationInfoQueryParams(queryVariables.pagination);
        fetchMore({
          variables: {
            paginationInfo: {
              limit: queryVariables.pagination.limit,
              skip: queryVariables.pagination.skip,
            },
            filters: {
              query: queryVariables.filters.query,
            },
          },
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      });

      watch(searchQuery, () => {
        queryVariables.filters.query = searchQuery.value;
      });

      return {
        jobs: computed(() => {
          return result.value?.Jobs || [];
        }),
        result,
        limit,
        searchQuery,
        queryVariables,
      };
    },
  });
</script>
