<template>
  <div class="w-full mx-4 my-1 flex items-center">
    <div
      :class="[`bg-${color} rounded h-1.5 w-full `]"
      :style="[`width: ${progressValue}%`]"
    ></div>
    <div class="bg-neutral-20 rounded h-1.5 w-full"></div>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent } from 'vue';

  export default defineComponent({
    name: 'ProgressBar',
    props: {
      progress: {
        type: Number,
        default: 100,
        required: true,
      },
      color: {
        type: String,
        default: 'neutral-700',
      },
    },
    setup(props) {
      const progressValue = computed(() => {
        if (props.progress > 100 || props.progress < 0) return 0;
        else return props.progress;
      });
      return {
        progressValue,
      };
    },
  });
</script>
