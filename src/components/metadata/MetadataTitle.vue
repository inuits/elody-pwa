<template>
  <div v-if="metadata.label" class="flex items-center gap-1">
    <p
      data-cy="metadata-label"
      class="text-label font-bold text-text-field-label"
    >
      {{ t(metadata.label) }}
    </p>
    <!-- Label adornments, in order: required / one-of-required, help. -->
    <span
      v-if="isOneOfRequired"
      data-cy="one-of-required-marker"
      role="img"
      class="text-label font-bold text-text-field-label"
      :aria-label="t('metadata.labels.one-of-required')"
      :title="t('metadata.labels.one-of-required')"
      >◦</span
    >
    <span
      v-else-if="isFieldRequired"
      data-cy="required-marker"
      class="text-label font-bold text-danger"
      >*</span
    >
    <base-tooltip
      v-if="metadata?.tooltip"
      position="top-right"
      :tooltip-offset="8"
    >
      <template #activator="{ on, describedBy }">
        <div v-on="on" :aria-describedby="describedBy" class="pl-1">
          <unicon :name="Unicons.QuestionCircle.name" height="12" />
        </div>
      </template>
      <template #default>
        <span>
          <div>
            {{ t(`${metadata.tooltip}`) }}
          </div>
        </span>
      </template>
    </base-tooltip>
    <div
      v-if="infoPanel?.content && !isLocked"
      data-testid="info-panel-trigger"
      class="cursor-pointer pl-1 text-text-light"
      @click="
        openPanel({ title: infoPanel.title ?? '', content: infoPanel.content })
      "
    >
      <unicon :name="Unicons.QuestionCircle.name" height="12" />
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
    isLocked?: boolean;
  }>(),
  {
    isOneOfRequired: false,
    isFieldRequired: false,
    isLocked: false,
  },
);
const { t } = useI18n();
const { openPanel } = useInfoPanel();

const infoPanel = computed(() => props.metadata.infoPanel ?? null);
</script>
