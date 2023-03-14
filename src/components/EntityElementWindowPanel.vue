<template>
  <div class="border-solid border-neutral-30 border-b-2 p-2">
    <div class="flex items-center justify-between">
      <h2>{{ panel.label }}</h2>
      <div @click="toggleIsCollapsed()" class="cursor-pointer">
        <unicon :name="!isCollapsed ? Unicons.Minus.name : Unicons.Plus.name" />
      </div>
    </div>
    <transition>
      <div v-if="!isCollapsed">
        <div v-if="panelType === PanelType.Relation">
          <div class="pl-2 rounded-sm bg-accent-light">
            <p class="text-sm text-text-body">Behoort tot</p>
            <div class="rounded-sm border-solid border-neutral-30 border-2">
              <div
                v-for="(relation, index) in relationArray"
                :key="index"
                class="bg-neutral-white py-2"
              >
                <entity-element-relation :relation="relation" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div
            v-for="(metadata, index) in metadataArray"
            :key="index"
            class="py-2"
          >
            <entity-element-metadata
              :label="metadata.key"
              :value="metadata.value"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import type {
  KeyValue,
  MediaFile,
  MetadataValuesInput,
  PanelMetaData,
  PanelRelation,
  WindowElementPanel,
} from "@/generated-types/queries";
import { PanelType } from "@/generated-types/queries";
import { ref, watch } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import EntityElementRelation from "./EntityElementRelation.vue";
import { Unicons } from "@/types";
import { useField } from "vee-validate";
import { useEntityMediafileSelector } from "./EntityImageSelection.vue";

const props = defineProps<{
  panel: WindowElementPanel;
}>();

const panelType = ref<PanelType>(props.panel.panelType);
const isCollapsed = ref<boolean>(false);
const metadataArray = ref<MetadataValuesInput[]>([]);
const relationArray = ref<PanelRelation[]>([]);
const { mediafileSelectionState } = useEntityMediafileSelector();

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getMetadataForPanel = (): MetadataValuesInput[] => {
  const returnArray: MetadataValuesInput[] = [];
  Object.values(props.panel).forEach((value) => {
    if (value && typeof value !== "string") {
      const metadataObject = {
        key: (value as PanelMetaData).label,
        value: useField((value as PanelMetaData).key).value.value as string,
      };
      returnArray.push(metadataObject);
    }
  });

  return returnArray;
};

const getRelationsForPanel = (): PanelRelation[] => {
  const returnArray: PanelRelation[] = [];
  Object.values(props.panel).forEach((value) => {
    if (typeof value !== "string") {
      const relationList = value as [PanelRelation];
      returnArray.push(...relationList);
    }
  });

  return returnArray;
};

const getMediaInfo = (): MetadataValuesInput[] => {
  const returnArray: MetadataValuesInput[] = [];
  const selectedMediafile: { [index: string]: any } | undefined =
    mediafileSelectionState.selectedMediafile;
  Object.values(props.panel).forEach((value) => {
    if (typeof value !== "string" && selectedMediafile) {
      const valueKey = (value as PanelMetaData).key;
      returnArray.push({
        key: (value as PanelMetaData).label,
        value: selectedMediafile[valueKey],
      });
    }
  });
  return returnArray;
};

watch(
  () => mediafileSelectionState.selectedMediafile,
  () => {
    if (panelType.value === PanelType.Metadata) {
      metadataArray.value = getMetadataForPanel();
    } else if (panelType.value === PanelType.Relation) {
      relationArray.value = getRelationsForPanel();
    } else if (panelType.value === PanelType.Mediainfo) {
      metadataArray.value = getMediaInfo();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.5s ease;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);
  transform-origin: top;
}
</style>
