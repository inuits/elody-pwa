<template>
  <entity-element-wrapper :label="label">
    <template v-slot:content>
      <!-- Not yet refactored old component -->
      <media-viewer :loading="false" entityType="MediaFile" />
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
