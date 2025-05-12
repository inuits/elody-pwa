<template>
  <div class="text-text-light text-sm flex">
    <p data-cy="metadata-label">
      {{ metadata.label ? t(metadata.label) : t("metadata.no-label") }}
    </p>
    <p
      v-if="
        metadata?.inputField &&
        useEditHelper.isEdit &&
        (isOneOfRequiredMetadataField || isOneOfRequiredRelationField)
      "
      class="pl-1"
    >
      ( {{ t("metadata.labels.one-of-required") }} )
    </p>
    <p
      v-else-if="
        metadata?.inputField &&
        !metadata.isFieldRequired &&
        useEditHelper.isEdit
      "
      class="pl-1"
    >
      ( {{ t("metadata.labels.optional") }} )
    </p>
    <base-tooltip
      v-if="metadata?.tooltip"
      position="top-right"
      :tooltip-offset="8"
    >
      <template #activator="{ on }">
        <div v-on="on" class="pl-1">
          <unicon :name="Unicons.QuestionCircle.name" height="20" />
        </div>
      </template>
      <template #default>
        <span class="text-sm text-text-placeholder">
          <div>
            {{ t(`${metadata.tooltip}`) }}
          </div>
        </span>
      </template>
    </base-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";
import type {
  PanelMetaData,
  PanelRelationMetaData,
  PanelRelationRootData,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { inject } from "vue";

const props = withDefaults(
  defineProps<{
    metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
    isOneOfRequiredMetadataField?: Boolean;
    isOneOfRequiredRelationField?: Boolean;
  }>(),
  { isOneOfRequiredMetadataField: false, isOneOfRequiredRelationField: false },
);

const entityFormData: any = inject("entityFormData");
const useEditHelper = useEditMode(entityFormData?.id);
const { t } = useI18n();
</script>

<style scoped></style>
