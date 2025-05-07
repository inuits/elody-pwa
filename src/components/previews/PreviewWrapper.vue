<template>
  <h1
    data-cy="entity-element-window-title"
    class="subtitle text-text-body p-2 text-center"
  >
    {{ t(previewComponent.title)}}
  </h1>
  <ViewModesMap
    v-if="previewComponent.type === PreviewTypes.Map"
    :config="configPerViewMode[ViewModes.ViewModesMap]"
    :entities="entities"
  />
  <MediaViewerPreview
    v-if="previewComponent.type === PreviewTypes.MediaViewer"
    :entities="entities"
    :preview-for-entity="previewForEntity"
  />
</template>


<script setup lang="ts">

import {
  type Entity,
  type PreviewComponent,
  ViewModes,
  PreviewTypes
} from "@/generated-types/queries";
import ViewModesMap from "@/components/library/view-modes/ViewModesMap.vue";
import MediaViewerPreview from "@/components/previews/MediaViewerPreview.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();


const props = withDefaults(
  defineProps<{
    previewComponent: PreviewComponent;
    entityType: string;
    entities: Entity[];
    configPerViewMode: object;
    previewForEntity: string | undefined;
  }>(),
  {
  },
);

</script>


<style scoped>
</style>