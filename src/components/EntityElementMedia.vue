<template>
  <entity-element-wrapper :label="label" class="flex flex-col h-full">
    <template v-slot:content>
      <!-- Not yet refactored old component -->
      <media-viewer :loading="false" entityType="MediaFile" class="flex-1" />
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import EntityElementWrapper from "./base/EntityElementWrapper.vue";
import MediaViewer from "./base/Mediaviewer.vue";

const props = defineProps<{
  label: string;
}>();
</script>
