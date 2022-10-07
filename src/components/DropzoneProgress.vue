<template>
  <div
    v-show="progress.status === 'inProgress'"
    class="fixed w-14 h-14 bg-neutral-900 rounded-full bottom-5 right-10 flex flex-col justify-center transform items-center"
  >
    <span class="text-neutral-0 font-bold"> {{ progress.progress }}% </span>
  </div>
  <div v-if="progress.status === 'hasError' || progress.status === 'success'">
    <span
      class="text-base text-neutral-0 font-light"
      v-show="progress.successFiles > 0"
      >{{ progress.successFiles }} documents successful uploaded</span
    >
    <span
      class="text-base text-red-default font-light"
      v-show="progress.errorFiles > 0"
      >{{ progress.errorFiles }} documents failed uploaded</span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "DropzoneProgress",
  props: {
    progress: { type: Object as PropType<any>, required: true },
  },
});
</script>
