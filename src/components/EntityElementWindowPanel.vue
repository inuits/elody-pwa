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
        <div v-if="panelType === PanelType.Relation && relationArray.length">
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
              v-if="!isEdit || !metadata.field"
              :label="metadata.label"
              :value="metadata.value"
            />
            <entity-element-metadata-edit
              v-else-if="panel.isEditable"
              :fieldKey="metadata.key"
              :label="metadata.label"
              v-model:value="metadata.value"
              :field="metadata.field"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import type {
  InputField,
  PanelMetaData,
  PanelRelation,
  WindowElementPanel,
} from "@/generated-types/queries";
import { PanelType } from "@/generated-types/queries";
import { computed, onMounted, ref, watch } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import EntityElementMetadataEdit from "./EntityElementMetadataEdit.vue";
import EntityElementRelation from "./EntityElementRelation.vue";
import { Unicons } from "@/types";
import type { FormContext } from "vee-validate";
import { useEntityMediafileSelector } from "./EntityImageSelection.vue";
import { useEditMode } from "@/composables/useEdit";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";

type MetadataField = {
  key: string;
  label: string;
  value: string;
  field: InputField;
};

const props = defineProps<{
  panel: WindowElementPanel;
}>();

const panelType = ref<PanelType>(props.panel.panelType);
const isCollapsed = ref<boolean>(props.panel.isCollapsed);
const { mediafileSelectionState } = useEntityMediafileSelector();
const { getForm } = useFormHelper();
const { isEdit } = useEditMode();

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getValueFromForm = (metadataItemKey: string): string => {
  const id = getEntityIdFromRoute() || "";
  const form = getForm(id);
  if (!form) {
    return "-";
  }

  return form.values[metadataItemKey] || "-";
};

const getMetadata = () => {
  const returnArray: MetadataField[] = [];
  Object.values(props.panel).forEach((value) => {
    if (value && typeof value === "object") {
      const metadataItemKey: string = (value as PanelMetaData).key;
      const metadataObject = {
        key: metadataItemKey,
        label: (value as PanelMetaData).label,
        value: getValueFromForm(metadataItemKey),
        field: (value as PanelMetaData).inputField,
      };
      returnArray.push(metadataObject);
    }
  });
  return returnArray;
};

const getMetadataFromMediafile = () => {
  const returnArray: MetadataField[] = [];
  const selectedMediafile: { [index: string]: any } | undefined =
    mediafileSelectionState.selectedMediafile;
  Object.values(props.panel).forEach((value) => {
    if (typeof value === "object" && selectedMediafile) {
      const valueKey = (value as PanelMetaData).key;
      returnArray.push({
        key: valueKey,
        label: (value as PanelMetaData).label,
        value: selectedMediafile[valueKey],
        field: (value as PanelMetaData).inputField,
      });
    }
  });
  return returnArray;
};

const metadataArray = computed((): MetadataField[] => {
  if (panelType.value === PanelType.Metadata) {
    return getMetadata();
  } else {
    return getMetadataFromMediafile();
  }
});

const relationArray = computed((): PanelRelation[] => {
  let returnArray: PanelRelation[] = [];
  Object.values(props.panel).forEach((value) => {
    if (typeof value === "object") {
      const relationList = value as [PanelRelation];
      try {
        if (!relationList.length) {
          throw Error("Value can not be spread");
        }
        returnArray.push(...relationList);
      } catch (e) {
        returnArray = relationList;
      }
    }
  });
  return returnArray;
});
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
