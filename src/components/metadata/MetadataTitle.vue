<template>
  <div v-if="metadata.label" class="text-text-light text-sm flex">
    <p data-cy="metadata-label">
      {{ t(metadata.label) }}
    </p>
    <p v-if="isOneOfRequired" class="pl-1">
      ( {{ t("metadata.labels.one-of-required") }} )
    </p>
    <p v-else-if="isFieldRequired" class="pl-1">*</p>
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
    <div
      v-if="infoPanel?.content"
      data-testid="info-panel-trigger"
      class="cursor-pointer pl-1 text-text-light"
      @click="
        openPanel({ title: infoPanel.title ?? '', content: infoPanel.content })
      "
    >
      <unicon :name="Unicons.QuestionCircle.name" height="20" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";
import { useInfoPanel } from "@/composables/useInfoPanel";
import type {
  PanelMetaData,
  PanelRelationMetaData,
  PanelRelationRootData,
} from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
    isFieldRequired?: boolean;
    isOneOfRequired?: boolean;
  }>(),
  {
    isOneOfRequired: false,
    isFieldRequired: false,
  },
);
const { t } = useI18n();
const { openPanel } = useInfoPanel();

const infoPanel = computed(() => props.metadata.infoPanel ?? null);
</script>
