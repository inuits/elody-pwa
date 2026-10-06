<template>
  <div>
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
      <template
        v-for="(metadata, index) in metadatafields"
        :key="metadata.key"
      >
        <MultilingualWrapper
          v-if="itemMustBeShown(metadata)"
          :metadata="metadatafields[index]"
          :form-id="formId"
        >
          <template #default="{ localizedMetadata }">
            <metadata-wrapper
              v-if="
                !nonStandardFieldTypes.includes(metadata.__typename)  &&
                !parentIsListItem &&
                metadata.unit !== Unit.CoordinatesDefault
              "
              class="py-2 px-2"
              :form-id="formId"
              :is-edit="false"
              :repeatablePanelConfig="repeatablePanelConfig"
              :metadata="localizedMetadata || metadatafields[index]"
              :show-errors="false"
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
              :permitted="metadata.permitted"
            />

            <history-relation-diff
              v-if="
                metadata.__typename === nonStandardFieldTypes[0] &&
                hasRelationDiff(relationDiffs, metadata)
              "
              :label="metadata.label"
              :items="relationDiffItemsFor(relationDiffs, metadata)"
            />
            <wysiwyg-read-only
              v-if="metadata.__typename === nonStandardFieldTypes[1]"
              class="py-2 px-2 mb-2"
              :form-id="formId"
              :element="localizedMetadata || metadata"
              :changed="wysiwygDiffFor(metadata)?.changed ?? false"
              :color-variant="wysiwygDiffFor(metadata)?.colorVariant ?? 'current'"
            />
          </template>
        </MultilingualWrapper>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  PanelType,
  Unit,
  type PanelRelation,
  type MetadataField,
} from "@/generated-types/queries";
import HistoryRelationDiff from "@/components/history/HistoryRelationDiff.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import EntityElementCoordinateEdit from "@/components/EntityElementCoordinateEdit.vue";
import WysiwygReadOnly from "@/components/history/WysiwygReadOnly.vue";
import EntityElementRelation from "@/components/EntityElementRelation.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";
import {
  hasRelationDiff,
  relationDiffItemsFor,
  type RelationDiff,
  type WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

const props = defineProps<{
  panelType: PanelType;
  relationArray: PanelRelation[];
  metadatafields: MetadataField[];
  canBeMultipleColumns: boolean;
  formId: string;
  identifiers: string[];
  parentIsListItem: boolean;
  repeatablePanelConfig?: PanelRepetitionProps;
  wysiwygDiffs: WysiwygDiff[];
  relationDiffs: RelationDiff[];
}>();

const { t } = useI18n();
const config = inject("config") as any;
const { getForm } = useFormHelper();
const nonStandardFieldTypes = ["EntityListElement", "WysiwygElement"];

const isEmptyValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const itemMustBeShown = (metadata: MetadataField): boolean => {
  if (config?.customization?.hideEmptyFields !== true) return true;
  if (nonStandardFieldTypes.includes(metadata.__typename as string)) return true;
  const key = (metadata as any).key ?? (metadata as any).metadataKey;
  const diffedValue = key
    ? getForm(props.formId)?.values?.intialValues?.[key]
    : undefined;
  return !isEmptyValue(diffedValue ?? metadata.value);
};

const wysiwygDiffFor = (metadata: any): WysiwygDiff | undefined =>
  props.wysiwygDiffs?.find((diff) => diff.key === metadata.metadataKey);
</script>
