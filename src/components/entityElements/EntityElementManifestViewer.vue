<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="h-[80vh]"
  >
    <template v-slot:actions>
      <div
        v-if="!isInManifestCollection"
        class="flex items-center text-text-subtitle ml-4 cursor-pointer"
        @click="addToManifestCollection"
      >
        <unicon :name="Unicons.PlusCircle.name" :height="20"></unicon>
        <p class="text-text-subtitle">
          {{ t("manifest-viewer.add-to-manifest-collection") }}
        </p>
      </div>
      <div
        v-else
        class="flex items-center text-text-subtitle ml-4 cursor-pointer"
        @click="removeFromManifestCollection"
      >
        <unicon :name="Unicons.Minus.name" :height="20"></unicon>
        <p class="text-text-subtitle">
          {{ t("manifest-viewer.remove-from-manifest-collection") }}
        </p>
      </div>
    </template>
    <template v-slot:content>
      <ManifestViewer
        v-if="element.manifestUrl"
        :manifest-url="element.manifestUrl"
        :viewers="availableViewers"
      />
      <div v-else>
        <p>{{ t("manifest-viewer.no-manifest") }}</p>
      </div>
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import ManifestViewer from "@/components/ManifestViewer.vue";
import { useI18n } from "vue-i18n";
import type { ManifestViewerElement } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { Unicons } from "@/types";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { computed } from "vue";

const props = defineProps<{
  element: ManifestViewerElement;
}>();

const { t } = useI18n();
const {
  enqueueItemForBulkProcessing,
  dequeueItemForBulkProcessing,
  isEnqueued,
} = useBulkOperations();
const context = BulkOperationsContextEnum.ManifestCollection;
const isInManifestCollection = computed(() =>
  isEnqueued(context, props.element.manifestUrl)
);
const availableViewers = computed(() => {
  const viewers: string[] = ["tify", "mirador"];
  if (props.element.manifestVersion === 3) viewers.splice(0, 1);
  return viewers;
});

const removeFromManifestCollection = () => {
  dequeueItemForBulkProcessing(context, props.element.manifestUrl);
};

const addToManifestCollection = () => {
  enqueueItemForBulkProcessing(context, { id: props.element.manifestUrl });
};
</script>
