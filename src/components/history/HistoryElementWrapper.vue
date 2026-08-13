<template>
  <div
    class="border-solid border-neutral-30 border-2 bg-background-light rounded-t-md mb-5"
  >
    <div
      v-if="label"
      class="border-solid border-neutral-30 border-b-2 rounded-t-md flex items-center justify-between p-2"
    >
      <h2>{{ $t(label) }}</h2>
    </div>
    <div class="p-2 w-full">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string | null;
}>();
</script>
