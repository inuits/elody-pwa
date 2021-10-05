<template>
  <div class="bg-neutral-20 rounded px-6 py-4 text-sm mx-2 my-1">
    <div class="bg-neutral-0 flex flex-row rounded-t-lg px-6 py-4 items-center">
      <div class="p-2 rounded flex justify-center items-center bg-neutral-20">
        <Icon
          :name="Unicons.Export.name"
          height="18"
          :fill="`blue-500`"
        />
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100">ID
          <p class="text-neutral-700 flex-wrap">ewqeqwqeewq</p>
        </span>
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100">Date
          <p class="text-neutral-700">uasdosdaddsadsadsadsoa</p>
        </span>
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100">Type
          <p class="text-neutral-700">uasdodsoa</p>
        </span>
      </div>
      <div class="my-1 mx-6">
        <span class="text-neutral-100">User
          <p class="text-neutral-700">uasdodsoa</p>
        </span>
      </div>
      <Label :name="'50%'"/>
      <ProgressBar :progress="50"/>
      <BaseButton
        label="collaps"
        :icon="Unicons.Minus.name"
        @click="toggleCollapse"
        /> 
    </div>
    <div v-if="isCollapsed">
      <div v-for="job in jobs" :key="job.job_id">
        <JobComp :job="job" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Unicons } from '@/types';
import Icon from '@/components/base/Icon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import ProgressBar from '@/components/base/ProgressBar.vue';
import Label from '@/components/base/Label.vue';
import JobComp from '@/components/Job.vue';
import { Job } from '@/queries';


export default defineComponent({
  name: "ParentJob",
  components: { JobComp, Icon, ProgressBar, BaseButton, Label },
  props: {
    jobs: {
      type: Array as PropType<Job[]>
    }
  },
  setup() {
    const isCollapsed = ref<Boolean>(false);
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    return {Unicons, toggleCollapse, isCollapsed};
  },
});
</script>
