<template>
  <div class="bg-neutral-20 rounded px-6 py-4 text-sm mx-2 my-1">
    <div class="bg-neutral-0 flex flex-row rounded-t-lg px-6 py-4 items-center">
      <div class="p-2 rounded flex justify-center items-center bg-neutral-20">
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

      <BaseButton
        v-if="subjobs.length > 0 && isCollapsed != true"
        label="Expand"
        :icon="Unicons.Plus.name"
        @click="toggleCollapse"
      />
      <BaseButton
        v-if="subjobs.length > 0 && isCollapsed == true"
        label="Collaps"
        :icon="Unicons.Minus.name"
        @click="toggleCollapse"
      />
    </div>
    <div v-if="isCollapsed">
      <div v-for="subJob in subjobs" :key="subJob.job_id">
        <JobComp :job="subJob" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, ref, reactive } from 'vue';
  import { Unicons } from '@/types';
  import Icon from '@/components/base/Icon.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import ProgressBar from '@/components/base/ProgressBar.vue';
  import Label from '@/components/base/Label.vue';
  import JobComp from '@/components/Job.vue';
  import { Job } from '@/queries';

  export enum Status {
    Finished = 'finished',
    Failed = 'failed',
    Pending = 'pending',
  }

  export type State = {
    name: 'failed' | 'pending' | 'finished';
    color: 'red-default' | 'neutral-700' | 'green-default';
    message?: string;
  };

  export default defineComponent({
    name: 'ParentJob',
    components: { JobComp, Icon, ProgressBar, BaseButton, Label },
    props: {
      job: {
        type: String as PropType<Job>,
        required: true,
      },
      subjobs: {
        type: Array as PropType<Job[]>,
        default: () => [],
      },
    },
    setup(props) {
      const isCollapsed = ref<Boolean>(false);

      const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value;
      };
      const jobTime = computed(() => {
        const diff =
          new Date(props.job.end_time as string).valueOf() -
          new Date(props.job.start_time as string).valueOf();
        var timeElapsed = Math.ceil(diff / (1000 * 3600 * 24));
        return timeElapsed;
      });

      const jobStartDate = computed(() => {
        return new Date(props.job.start_time as string).toLocaleString();
      });
      const state = computed((): State => {
        switch (props.job.status) {
          case Status.Finished:
            return {
              name: Status.Finished,
              color: 'green-default',
              message: `${jobTime.value} upload time`,
            } as State;
          case Status.Failed:
            return {
              name: Status.Failed,
              color: 'red-default',
              message: 'failed',
            } as State;
          default:
            return {
              name: Status.Pending,
              color: 'neutral-700',
              message: 'pending',
            } as State;
        }
      });

      return {
        Unicons,
        toggleCollapse,
        isCollapsed,
        jobStartDate,
        jobs: [],
        state,
        jobTime,
      };
    },
  });
</script>
