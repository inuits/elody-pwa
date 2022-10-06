<template>
  <div class="p-6">
    <div class="flex flex-row gap-y-4 items-center text-xs bg-neutral-0">
      <InputField
        v-if="false"
        v-model="searchQuery"
        :debounce="true"
        placeholder="Search History"
        label=""
        :bg-color="'neutral-20'"
      />
      <div class="my-2 flex flex-row justify-left">
        <BaseDropdown
          v-model="queryVariables.filters.type"
          :options="jobTypes"
        />
      </div>
      <div class="my-2 flex flex-row justify-left">
        <BaseDropdown
          v-model="queryVariables.pagination.limit"
          :options="paginationLimits"
        />
      </div>
      <div class="flex-grow"></div>
      <BasePagination
        v-if="jobs.count > 0"
        v-model:skip="queryVariables.pagination.skip"
        v-model:limit="queryVariables.pagination.limit"
        :total-items="jobs.count"
      />
    </div>
    <ListContainer>
      <div v-if="jobs.results">
        <div v-for="job in jobs.results" :key="job.job_key">
          <ParentJob :job="job" />
        </div>
      </div>
    </ListContainer>
  </div>
</template>

<script lang="ts">
import { GetJobsDocument } from "@/queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent, ref, watch, reactive } from "vue";
import ParentJob from "@/components/ParentJob.vue";
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import InputField from "@/components/base/InputField.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import type {
  paginationLimits,
  PaginationInfo,
} from "@/components/base/BasePagination.vue";
import useJobHelpers, { jobTypeLabels } from "@/composables/useJobHelpers";
import ListContainer from "@/components/ListContainer.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";

type Filter = {
  query: string;
  type: string;
};

type QueryVariables = {
  pagination: PaginationInfo;
  filters: Filter;
};

export default defineComponent({
  name: "HistoryView",
  components: {
    ParentJob,
    BaseDropdown,
    BasePagination,
    InputField,
    ListContainer,
  },
  setup() {
    const jobhelper = useJobHelpers();
    const jobTypes = jobhelper.getJobTypes();
    const routeHelper = useRouteHelpers();
    const paginationInfo = reactive({
      limit: 20,
      skip: 1,
    });
    routeHelper.getPaginationInfoFromUrl(paginationInfo);
    const searchQuery = ref("");
    const showAll = ref("csv import");
    const queryVariables = reactive<QueryVariables>({
      pagination: paginationInfo,
      filters: {
        query: searchQuery.value,
        type: showAll.value,
      },
    });

    const { result, fetchMore } = useQuery(GetJobsDocument, {
      paginationInfo: {
        limit: queryVariables.pagination.limit,
        skip: queryVariables.pagination.skip - 1,
      },
      filters: {
        query: queryVariables.filters.query,
        type: jobTypeLabels[queryVariables.filters.type],
      },
    });

    watch(queryVariables, () => {
      routeHelper.updatePaginationInfoQueryParams(queryVariables.pagination);
      getData();
    });

    const getData = () => {
      fetchMore({
        variables: {
          paginationInfo: {
            limit: Number(queryVariables.pagination.limit),
            skip:
              Number(queryVariables.pagination.skip - 1) *
              Number(queryVariables.pagination.limit),
          },
          filters: {
            query: queryVariables.filters.query,
            type: jobTypeLabels[queryVariables.filters.type],
          },
        },
        updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
      });
    };

    watch(searchQuery, () => {
      queryVariables.filters.query = searchQuery.value;
      getData();
    });

    return {
      jobs: computed(() => {
        return result.value?.Jobs || [];
      }),
      result,
      searchQuery,
      queryVariables,
      jobTypes,
      paginationLimits,
    };
  },
});
</script>
