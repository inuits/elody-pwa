<template>
  <h1
    data-cy="entity-element-window-title"
    class="subtitle text-text-body p-2 text-center"
  >
    {{ t(previewComponent.title)}}
  </h1>
  <ViewModesMap
    v-if="previewComponent.previewType === PreviewTypesEnum.MapPreview"
    :config="configPerViewMode[ViewModes.ViewModesMap]"
    :entities="entities"
  />
</template>


<script setup lang="ts">

import {
  type Entity,
  type PreviewComponent,
  ViewModes,
  PreviewTypesEnum
} from "@/generated-types/queries";
import ViewModesMap from "@/components/library/view-modes/ViewModesMap.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();


const props = withDefaults(
  defineProps<{
    previewComponent: PreviewComponent;
    entityType: string;
    entities: Entity[];
    configPerViewMode: object;
  }>(),
  {
  },
);

</script>


<style scoped>
</style>