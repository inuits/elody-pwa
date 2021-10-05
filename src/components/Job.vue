<template>
   <div class="flex flex-row bg-neutral-0 px-6 py-2 rounded justify-center my-2">
      <div class="px-3 rounded flex justify-center items-center bg-neutral-20">
         <Icon
        name="image"
        height="18"
        :fill="`blue-500`"
      />
      </div>  
      <p class="w-2/6 mx-4 flex items-center">{{job.job_info}}</p>
      <div class="text-neutral-0 text-ms rounded block h-2 px-6 py-1 bg-neutral-700 h-full text-center align-middle">40%</div>
      <ProgressBar :progress="50"/>
      <BaseButton
        label="view"
        :icon="Unicons.Eye.name"
        /> 
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Unicons } from '@/types';
import ProgressBar from '@/components/base/ProgressBar.vue';
import Icon from '@/components/base/Icon.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { Job } from '@/queries';

export default defineComponent({
  name: "Job",
  components: { ProgressBar, Icon, BaseButton },
  props: {
    job: {
      type: String as PropType<Job>,
      required: true,
    },
  },
  setup() {
    return {Unicons};
  },
});
</script>
