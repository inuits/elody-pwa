<template>
  <div v-if="metadata.label" class="flex items-center gap-1">
    <p
      :id="labelId"
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
        <button
          type="button"
          data-cy="field-help-trigger"
          v-on="on"
          :aria-label="helpLabel"
          :aria-describedby="describedBy"
          class="pl-1"
        >
          <unicon :name="Unicons.QuestionCircle.name" height="14" />
        </button>
      </template>
      <template #default>
        <span>
          <div>
            {{ t(`${metadata.tooltip}`) }}
          </div>
        </span>
      </template>
    </base-tooltip>
    <button
      v-if="infoPanel?.content && !isLocked"
      type="button"
      data-testid="info-panel-trigger"
      class="pl-1 text-text-light"
      :aria-label="helpLabel"
      @click="
        openPanel({ title: infoPanel.title ?? '', content: infoPanel.content })
      "
    >
      <unicon :name="Unicons.QuestionCircle.name" height="14" />
    </button>
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
    labelId?: string;
  }>(),
  {
    isOneOfRequired: false,
    isFieldRequired: false,
    isLocked: false,
  },
);
const { t, te } = useI18n();
const { openPanel } = useInfoPanel();

const helpLabel = computed<string>(() => {
  const label = t(props.metadata.label ?? "");
  return te("metadata.labels.field-help")
    ? t("metadata.labels.field-help", [label])
    : `About ${label}`;
});

const infoPanel = computed(() => props.metadata.infoPanel ?? null);
</script>
