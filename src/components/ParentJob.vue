<template>
  <div class="bg-neutral-20 rounded px-1 py-1 text-sm text-neutral-700">
    <div class="bg-neutral-0 flex flex-row rounded-t-lg px-4 py-2 items-center">
      <div class="p-1 rounded flex justify-center items-center bg-neutral-20">
        <Icon :name="Unicons.Export.name" height="18" :fill="`blue-500`" />
      </div>
      <div class="my-1 mx-6 w-2/6">
        <span class="text-neutral-100"
          >ID
          <p class="text-neutral-700 flex-wrap">{{ job._key }}</p>
        </span>
      </div>
      <div class="my-1 mx-6 w-1/6">
        <span class="text-neutral-100"
          >Date
          <p class="text-neutral-700">{{ jobStartDate }}</p>
        </span>
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100"
          >Type
          <p class="text-neutral-700">{{ job.job_type }}</p>
        </span>
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100"
          >User
          <p class="text-neutral-700">{{ job.user }}</p>
        </span>
      </div>

      <div class="w-3/6">
        <div v-if="job.status != 'pending'" class="flex flex-row mx-2">
          <Label :name="state.name" :color="state.color" />
        </div>
        <div v-if="job.status == 'pending'">
          <Label :name="'50%'" />
          <ProgressBar :progress="50" />
        </div>
      </div>
      <div v-if="job.amount_of_jobs > 1">
        <BaseButton
          v-if="isCollapsed == true"
          label="Expand"
          :icon="Unicons.Plus.name"
          @click="toggleCollapse"
        />
        <BaseButton
          v-if="isCollapsed != true"
          label="Collaps"
          :icon="Unicons.Minus.name"
          @click="toggleCollapse"
        />
      </div>
    </div>
    <div v-if="!isCollapsed">
      <ListContainer>
        <div v-for="subJob in subJobs" :key="subJob.job_id">
          <JobComp :job="subJob" />
        </div>
      </ListContainer>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    onUpdated,
    PropType,
    ref,
    watch,
  } from 'vue';
  import { Unicons } from '@/types';
  import Icon from '@/components/base/Icon.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import ProgressBar from '@/components/base/ProgressBar.vue';
  import Label from '@/components/base/Label.vue';
  import JobComp from '@/components/Job.vue';
  import { GetJobDocument, Job } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import useJobHelpers from '@/composables/useJobHelpers';
  import ListContainer from '@/components/ListContainer.vue';

  export default defineComponent({
    name: 'ParentJob',
    components: { JobComp, Icon, ProgressBar, BaseButton, Label, ListContainer },
    props: {
      job: {
        type: Object as PropType<Job>,
        required: true,
      },
    },
    setup(props) {
      const jobHelper = useJobHelpers();
      const state = jobHelper.getJobStatus(props.job);
      const isCollapsed = ref<Boolean>(true);
      const { result, fetchMore } = useQuery(GetJobDocument, {
        id: props.job._key,
      });

      const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value;
        if (!isCollapsed.value) updateSubJobs();
      };
      const jobStartDate = jobHelper.getFormatedDate(props.job.start_time as string);
      const updateSubJobs = () => {
        fetchMore({
          variables: {
            id: props.job._key,
          },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return fetchMoreResult;
          },
        });
      };

      return {
        subJobs: computed(() => {
          return result.value?.Job?.sub_jobs;
        }),
        Unicons,
        toggleCollapse,
        isCollapsed,
        jobStartDate,
        state,
      };
    },
  });
</script>
