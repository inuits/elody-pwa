<template>
  <div class="p-6">
    <div class="flex flex-row gap-y-4 items-center text-xs bg-neutral-0">
      <InputField
        v-if="false"
        v-model="searchQuery"
        :debounce="true"
        :placeholder="$t('history-view.search')"
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
      <div class="my-2 flex flex-row justify-left">
        <IconToggle
          v-model:checked="showFailedOnly"
          :icon-on="Unicons.ExclamationTriangle.name"
          :icon-off="Unicons.CheckCircle.name"
        />
      </div>
      <div class="flex-grow"></div>
      <BasePagination
        v-if="
          jobs !== 'no-jobs' &&
          jobs.Jobs &&
          jobs.Jobs.count &&
          jobs.Jobs.count > 0
        "
        v-model:skip="queryVariables.pagination.skip"
        v-model:limit="queryVariables.pagination.limit"
        :total-items="jobs.Jobs.count === null ? undefined : jobs.Jobs.count"
      />
    </div>
    <ListContainer>
      <div v-if="jobs !== 'no-jobs' && jobs.Jobs && jobs.Jobs.results">
        <div
          v-for="job in jobs.Jobs.results"
          :key="job && job._id ? job._id : 'no-id'"
        >
          <ParentJob v-if="job" :job="job" />
        </div>
      </div>
    </ListContainer>
  </div>
</template>

<script lang="ts">
import { GetJobsDocument, Job } from "../queries";
import type { GetJobsQuery } from "../queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent, ref, watch, reactive } from "vue";
import ParentJob from "../components/ParentJob.vue";
import BaseDropdown from "../components/base/BaseDropdown.vue";
import InputField from "../components/base/InputField.vue";
import BasePagination from "../components/base/BasePagination.vue";
import { paginationLimits } from "../components/base/BasePagination.vue";
import type { PaginationInfo } from "../components/base/BasePagination.vue";
import { getJobTypes, jobTypeLabels } from "../composables/useJobHelpers";
import ListContainer from "../components/ListContainer.vue";
import useRouteHelpers from "../composables/useRouteHelpers";
import IconToggle from "../components/base/IconToggle.vue";
import { Unicons } from "../types";

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
    IconToggle,
  },
  setup() {
    const jobTypes = getJobTypes();
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
    const showFailedOnly = ref<boolean>(false);

    const { result, fetchMore } = useQuery(GetJobsDocument, {
      paginationInfo: {
        limit: queryVariables.pagination.limit,
        skip: queryVariables.pagination.skip - 1,
      },
      filters: {
        query: queryVariables.filters.query,
        type: jobTypeLabels[queryVariables.filters.type],
      },
      failed: showFailedOnly.value,
    });

    watch(queryVariables, () => {
      routeHelper.updatePaginationInfoQueryParams(queryVariables.pagination);
      getData();
    });

    watch(showFailedOnly, () => {
      getData();
    });

    const getData = () => {
      fetchMore({
        variables: {
          failed: showFailedOnly.value,
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
      jobs: computed<GetJobsQuery | "no-jobs">(() => {
        return result.value || "no-jobs";
      }),
      searchQuery,
      queryVariables,
      jobTypes,
      paginationLimits,
      showFailedOnly,
      Unicons,
    };
  },
});
</script>
