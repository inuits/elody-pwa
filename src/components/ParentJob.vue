<template>
  <div class="bg-neutral-20 rounded px-1 py-1 text-sm text-neutral-700">
    <div class="bg-neutral-0 flex flex-row rounded-t-lg px-4 py-2 items-center">
      <div class="p-1 rounded flex justify-center items-center bg-neutral-20">
        <BaseIcon :name="Unicons.Export.name" height="18" :fill="`blue-500`" />
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
          <p class="text-neutral-700">{{ getFormatedDate }}</p>
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
          <BaseLabel :name="getJobStatus.name" :color="getJobStatus.color" />
        </div>
        <div v-if="job.status == 'pending'">
          <BaseLabel :name="'50%'" />
          <ProgressBar :progress="50" />
        </div>
      </div>
      <div>
        <BaseButton
          v-if="isCollapsed == true"
          :class="{
            'opacity-0': !hasSubJobs,
            'cursor-default-important': !hasSubJobs,
          }"
          label="Expand"
          :icon="Unicons.Plus.name"
          @click="toggleCollapse()"
        />
        <BaseButton
          v-if="isCollapsed != true"
          :class="{
            'opacity-0': !hasSubJobs,
            'cursor-default-important': !hasSubJobs,
          }"
          label="Collaps"
          :icon="Unicons.Minus.name"
          @click="toggleCollapse()"
        />
      </div>
    </div>
    <div v-if="!isCollapsed && subJobs && subJobs.results">
      <ListContainer>
        <LoadingList v-if="loading" />
        <div
          v-for="subJob in subJobs.results.slice(0, subjobLimit)"
          :key="subJob && subJob._id ? subJob._id : 'no-id'"
        >
          <SingleJob v-if="subJob" :job="subJob" />
        </div>
        <div class="flex w-full justify-center">
          <button
            v-if="subjobLimit <= subJobs.results.length"
            class="w-full mx-4 px-3 py-2 hover:bg-neutral-30 rounded"
            @click="increaseSubjobs()"
          >
            Load more
          </button>
        </div>
      </ListContainer>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUpdate, ref } from "vue";
import type { PropType } from "vue";
import { Unicons } from "@/types";
import BaseIcon from "@/components/base/BaseIcon.vue";
import LoadingList from "@/components/base/LoadingList.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import ProgressBar from "@/components/base/ProgressBar.vue";
import BaseLabel from "@/components/base/BaseLabel.vue";
import SingleJob from "@/components/SingleJob.vue";
import { GetJobDocument } from "@/queries";
import type { Job } from "@/queries";
import { useQuery } from "@vue/apollo-composable";
import useJobHelpers from "@/composables/useJobHelpers";
import ListContainer from "@/components/ListContainer.vue";

export default defineComponent({
  name: "ParentJob",
  components: {
    SingleJob,
    BaseIcon,
    ProgressBar,
    BaseButton,
    BaseLabel,
    ListContainer,
    LoadingList,
  },
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true,
    },
  },
  setup(props) {
    const { getFormatedDate, getJobStatus } = useJobHelpers(props.job);
    const isCollapsed = ref<Boolean>(true);
    const fetchingSubJobs = ref<Boolean>(false);
    const queryOptions = ref({
      enabled: false,
    });
    const { result, refetch, loading } = useQuery(
      GetJobDocument,
      {
        id: props.job._key || "",
      },
      queryOptions
    );
    const subjobLimit = ref<number>(10);

    const hasSubJobs = computed<boolean>(() =>
      props.job.amount_of_jobs && props.job.amount_of_jobs > 1 ? true : false
    );

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
      if (!isCollapsed.value && hasSubJobs.value) {
        fetchingSubJobs.value = true;
        subjobLimit.value = 10;
        updateSubJobs();
      }
    };
    const updateSubJobs = () => {
      queryOptions.value = {
        enabled: true,
      };
      refetch();
    };

    onBeforeUpdate(() => {
      if (!fetchingSubJobs.value) isCollapsed.value = true;
    });

    const increaseSubjobs = () => {
      subjobLimit.value += 5;
    };

    return {
      subJobs: computed(() => {
        return result.value?.Job?.sub_jobs;
      }),
      Unicons,
      toggleCollapse,
      isCollapsed,
      getFormatedDate,
      getJobStatus,
      increaseSubjobs,
      subjobLimit,
      hasSubJobs,
      loading,
    };
  },
});
</script>
<style scoped>
.cursor-default-important {
  cursor: default !important;
}
</style>
