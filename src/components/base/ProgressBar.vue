<template>
  <div class="w-full bg-neutral-50 mx-2 my-1" >
    <div :class="[`bg-${color} rounded h-1 w-full flex`]" :style="[`width: ${progressValue}%`]"></div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: "ProgressBar",
  props: {
    progress: {
      type: Number,
      default: 100,
      required: true,
    },
    color: {
      type: String,
      default: "blue-500",
    }
  },
  setup(props) {
    const progressValue =computed(() => {
      if(props.progress > 100 || props.progress < 0)
        return 0;
      else return props.progress;
    });
    return {
      progressValue,
    };
  },
});
</script>
