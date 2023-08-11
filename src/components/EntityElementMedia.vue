<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions>
      <div
        v-if="isEdit && element.type !== MediaFileElementTypes.Map"
        class="flex items-center text-text-subtitle cursor-pointer"
      >
        <unicon height="16" :name="Unicons.PlusCircle.name" />
        <p
          class="underline"
          @click="
            () => {
              setAcceptedTypes([Entitytyping.Mediafile]);
              modal.openModal();
            }
          "
        >
          {{ t("window-element-labels.add-media") }}
        </p>
      </div>
    </template>
    <template v-slot:content>
      <BaseLibrary
        class="flex-1"
        v-if="
          !element.isCollapsed && element.type === MediaFileElementTypes.Media
        "
        :bulk-operations-context="BulkOperationsContextEnum.EntityElementMedia"
        :search-input-type-on-drawer="
          SearchInputType.AdvancedInputMediaFilesType
        "
        :predefined-entities="
          entityId === mediafileSelectionState.selectedMediafile?.id ||
          entityId === mediafileSelectionState.selectedMediafile?.uuid
            ? [mediafileSelectionState.selectedMediafile]
            : undefined
        "
        :enable-preview="true"
        :enable-advanced-filters="false"
        :enable-bulk-operations="true"
        :enable-navigation="false"
        :parent-entity-id="
          entityId === mediafileSelectionState.selectedMediafile?.id ||
          entityId === mediafileSelectionState.selectedMediafile?.uuid
            ? undefined
            : entityId
        "
        list-item-route-name="SingleEntity"
      />
      <!-- Not yet refactored old component -->
      <base-map
        v-if="
          !element.isCollapsed &&
          element.type === MediaFileElementTypes.Map &&
          mapComponentData
        "
        :element="element"
        :mapData="mapComponentData"
      ></base-map>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import {
  Entitytyping,
  MediaFileElementTypes,
  PanelType,
  SearchInputType,
  TypeModals,
  type MediaFileElement,
  type MetadataAndRelation,
  type PanelMetaData,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseMap from "./base/BaseMap.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import useEditMode from "@/composables/useEdit";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import useEntitySingle from "@/composables/useEntitySingle";
import { asString, getValueForPanelMetadata } from "@/helpers";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed } from "vue";
import { Unicons } from "@/types";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useRoute } from "vue-router";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  element: MediaFileElement;
}>();

const { t } = useI18n();
const { mediafileSelectionState } = useEntityMediafileSelector();
const { setAcceptedTypes } = useEntityPickerModal();
const { getEntityUuid } = useEntitySingle();
const { getModal } = useAvailableModals();
const { isEdit } = useEditMode();

const modal = getModal(TypeModals.EntityPicker);
const entityId = computed(
  () => getEntityUuid() || asString(useRoute().params["id"])
);

const mapComponentData = computed(() => {
  const returnArray: MetadataAndRelation[] = [];

  Object.values(props.element).forEach((value) => {
    if (typeof value === "object" && value.__typename === "PanelMetaData") {
      const metadataItemKey: string = (value as PanelMetaData).key;
      const metadataObject = {
        key: metadataItemKey,
        label: (value as PanelMetaData).label,
        value: getValueForPanelMetadata(
          PanelType.Metadata,
          metadataItemKey,
          entityId.value
        ),
        field: (value as PanelMetaData).inputField,
        unit: (value as PanelMetaData).unit,
      };
      returnArray.push(metadataObject);
    }
  });
  return returnArray;
});
</script>
