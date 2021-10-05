<template>
   <div class="flex flex-row bg-neutral-0 px-6 py-2 rounded justify-center my-2 text-sm items-center">
      <div class="p-2 rounded flex justify-center items-center bg-neutral-20">
         <Icon
        :name="Unicons.Image.name"
        height="18"
        :fill="`blue-500`"
      />
      </div>  
      <p class="w-2/6 mx-4 flex items-center">{{job.job_info}}</p>
      <Label :name="'50%'" :color="'blue-500'"/>
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
import Label from '@/components/base/Label.vue';
import { Job } from '@/queries';

export default defineComponent({
  name: "Job",
  components: { ProgressBar, Icon, BaseButton, Label },
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
