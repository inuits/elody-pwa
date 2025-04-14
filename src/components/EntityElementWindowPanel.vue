<template>
  <div
    class="border-solid border-neutral-30 border-b-2 p-2"
    :class="[{ 'pl-10  py-0': parentIsListItem }]"
  >
    <div
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <h2>{{ t(panel.label) }}</h2>
      <div class="flex justify-end">
        <unicon :name="!isCollapsed ? Unicons.Minus.name : Unicons.Plus.name" />
      </div>
    </div>
    <transition>
      <div v-show="!isCollapsed">
        <div v-if="panelType === PanelType.Relation && relationArray.length">
          <div class="pl-2 rounded-sm bg-accent-light">
            <p class="text-sm text-text-body">{{ t("entity.belongs-to") }}</p>
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
        <div
          v-else
          :class="[{ 'grid grid-cols-2 gap-2': canBeMultipleColumns }]"
        >
          <div
            v-for="(metadata, index) in metadatafields"
            v-show="itemMustBeShown(metadata.value)"
            :key="index"
          >
            <metadata-wrapper
              class="py-2 px-2"
              v-if="
                (!nonStandardFieldTypes.includes(metadata.__typename) ||
                  metadata.baseLibraryMode ===
                    BaseLibraryModes.BasicBaseLibrary) &&
                !parentIsListItem &&
                metadata.unit !== Unit.CoordinatesDefault
              "
              :form-id="formId"
              :is-edit="isEdit"
              v-model:metadata="metadata as MetadataField"
              :show-errors="showErrors"
              :base-library-mode="metadata.baseLibraryMode"
            />
            <entity-element-coordinate-edit
              v-if="
                metadata.inputField && metadata.unit === Unit.CoordinatesDefault
              "
              :fieldKey="metadata.key"
              :label="metadata.label"
              v-model:value="metadata.value"
              :input-field="metadata.inputField"
              :entity-uuid="formId"
              :can="metadata.can"
            />
            <entity-element-list
              v-if="metadata.__typename === nonStandardFieldTypes[0]"
              :label="metadata.label as string"
              :isCollapsed="metadata.isCollapsed"
              :types="metadata.entityTypes as string[]"
              :entity-type="metadata.entityTypes[0] as Entitytyping"
              :id="formId"
              :entity-id="formId"
              :entity-list="(metadata.entityList as Entity[]) ?? []"
              :identifiers="identifiers"
              :relationType="metadata.relationType"
              :viewMode="metadata.viewMode"
              :custom-query="metadata.customQuery"
              :custom-query-relation-type="metadata.customQueryRelationType"
              :custom-query-filters="metadata.customQueryFilters"
              :filters-need-context="metadata.filtersNeedContext"
              :search-input-type="metadata.searchInputType"
              :base-library-mode="metadata.baseLibraryMode"
              :entity-list-elements="
                getObjectsBasedOnTypename(metadata, nonStandardFieldTypes[0])
              "
              :can="metadata.can"
              :fetch-deep-relations="metadata.fetchDeepRelations"
              class="pt-2"
            />
            <entity-element-w-y-s-i-w-y-g
              v-if="metadata.__typename === nonStandardFieldTypes[1]"
              :form-id="formId"
              :element="metadata"
              :display-inline="true"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import {
  type PanelRelation,
  type WindowElementPanel,
  type Entity,
  type MetadataField,
  BaseLibraryModes,
  Unit,
  Entitytyping,
} from "@/generated-types/queries";
import EntityElementRelation from "@/components/EntityElementRelation.vue";
import EntityElementList from "@/components/entityElements/EntityElementList.vue";
import { computed, inject, ref } from "vue";
import { getMetadataFields, getObjectsBasedOnTypename } from "@/helpers";
import { PanelType } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useEditMode } from "@/composables/useEdit";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import EntityElementCoordinateEdit from "@/components/EntityElementCoordinateEdit.vue";
import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";

const props = withDefaults(
  defineProps<{
    panel: WindowElementPanel;
    identifiers: string[];
    isEdit: boolean;
    formId: string;
    parentIsListItem?: boolean;
  }>(),
  {
    parentIsListItem: false,
  },
);

const { t } = useI18n();
const { showErrors } = useEditMode();
const panelType = ref<PanelType>(props.panel.panelType);
const isCollapsed = ref<boolean>(props.panel.isCollapsed);
const canBeMultipleColumns = ref<boolean>(
  props.panel.canBeMultipleColumns || false,
);
const nonStandardFieldTypes = ["EntityListElement", "WysiwygElement"];
const config = inject("config") as any;

const itemMustBeShown = (value: any): boolean => {
  if (config.customization.hideEmptyFields === true && !value) return false;
  return true;
};

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

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

const metadatafields = computed(() => {
  return getMetadataFields(props.panel, panelType.value, props.formId);
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.1s linear;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);
  transform-origin: top;
}
</style>
