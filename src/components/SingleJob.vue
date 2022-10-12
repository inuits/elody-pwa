<template>
  <div
    class="px-4 py-2 flex flex-row bg-neutral-0 rounded my-2 mx-4 items-center text-neutral-700"
  >
    <div class="p-2 rounded flex justify-center items-center bg-neutral-20">
      <BaseIcon :name="Unicons.Image.name" height="16" :fill="`blue-500`" />
    </div>
    <p class="w-2/6 mx-4 flex items-center">{{ job.job_info }}</p>
    <BaseLabel :name="getJobStatus.name" :color="getJobStatus.color" />
    <div class="flex-grow p-10">
      {{ job.error_message ? job.error_message : "" }}
    </div>
    <BaseButton
      v-if="job.asset_id"
      label="view"
      :icon="Unicons.Eye.name"
      @click="
        router.push({ name: 'SingleEntity', params: { id: job.asset_id } })
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useRouter } from "vue-router";
import { Unicons } from "@/types";
import BaseIcon from "@/components/base/BaseIcon.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseLabel from "@/components/base/BaseLabel.vue";
import type { Job } from "@/queries";
import useJobHelpers from "@/composables/useJobHelpers";

export default defineComponent({
  name: "SingleJob",
  components: { BaseIcon, BaseButton, BaseLabel },
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true,
    },
  },
  setup(props) {
    const { getJobStatus } = useJobHelpers(props.job);
    const router = useRouter();
    return { Unicons, router, getJobStatus };
  },
});
</script>
