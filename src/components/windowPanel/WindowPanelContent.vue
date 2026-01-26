<template>
  <div
    :class="[
      {
        'flex items-end':
          repeatablePanelConfig?.repeatableFieldsHelper
            .repetitionDeleteIsAvailable.value,
      },
    ]"
  >
    <div v-if="panelType === PanelType.Relation && relationArray.length">
      <div class="pl-2 rounded-sm bg-accent-light">
        <p class="text-sm text-text-body">{{ t("entity.belongs-to") }}</p>
        <div class="rounded-sm border-solid border-neutral-30 border-2">
          <div
            v-for="(relation, index) in relationArray"
            :key="index"
            class="bg-background-light py-2"
          >
            <entity-element-relation :relation="relation" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      :class="[
        {
          'grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-2 max-w-full':
            canBeMultipleColumns,
        },
      ]"
    >
      <div
        v-for="(metadata, index) in metadatafields"
        v-show="itemMustBeShown(metadata.value)"
        :key="2"
      >
        <metadata-wrapper
          class="py-2 px-2"
          v-if="
            (!nonStandardFieldTypes.includes(metadata.__typename) ||
              metadata.baseLibraryMode === BaseLibraryModes.BasicBaseLibrary) &&
            !parentIsListItem &&
            metadata.unit !== Unit.CoordinatesDefault
          "
          :form-id="formId"
          :is-edit="isEdit"
          :repeatablePanelConfig="repeatablePanelConfig"
          :metadata="metadatafields[index]"
          :show-errors="editState.showErrors"
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
          :id="formId"
          :entity-id="formId"
          :entity-list="metadata.entityList ?? []"
          :identifiers="identifiers"
          v-bind="metadata"
        />
        <entity-element-w-y-s-i-w-y-g
          v-if="metadata.__typename === nonStandardFieldTypes[1]"
          :form-id="formId"
          :element="metadata"
          :display-inline="true"
        />
      </div>
    </div>
    <div
      class="pb-2"
      v-if="
        repeatablePanelConfig?.repeatableFieldsHelper
          .repetitionDeleteIsAvailable.value
      "
    >
      <base-button-new
        :icon="DamsIcons.Trash"
        @click="emit('decreaseRepeatedFieldAmount')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  PanelType,
  BaseLibraryModes,
  Unit,
  type PanelRelation,
  type MetadataField,
  DamsIcons,
} from "@/generated-types/queries";
import EntityElementList from "@/components/entityElements/EntityElementList.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import EntityElementCoordinateEdit from "@/components/EntityElementCoordinateEdit.vue";
import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityElementRelation from "@/components/EntityElementRelation.vue";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";

const emit = defineEmits<{
  (event: "decreaseRepeatedFieldAmount"): void;
}>();

const props = defineProps<{
  panelType: PanelType;
  relationArray: PanelRelation[];
  metadatafields: MetadataField[];
  canBeMultipleColumns: boolean;
  formId: string;
  isEdit: boolean;
  editState: any;
  identifiers: string[];
  parentIsListItem: boolean;
  repeatablePanelConfig?: PanelRepetitionProps;
}>();

const { t } = useI18n();
const config = inject("config") as any;
const nonStandardFieldTypes = ["EntityListElement", "WysiwygElement"];

const itemMustBeShown = (value: any): boolean => {
  if (config.customization.hideEmptyFields === true && !value) return false;
  return true;
};
</script>
