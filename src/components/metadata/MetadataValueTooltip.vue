<template>
  <base-tooltip
    class="w-full"
    position="right-end"
    :tooltip-offset="8"
    :max-width="isPreviewType ? 'md' : 56"
    :enable-auto-placement="false"
    v-if="canBeShownForPreviewType || canBeShownForPlaneType"
  >
    <template #activator="{ on }">
      <div v-on="on">
        <unicon :name="Unicons.InfoCircle.name" height="20" />
      </div>
    </template>
    <template #default>
      <div :class="`min-w-${isPreviewType ? 'md' : '56'} min-h-10`">
        <MetadataValueTooltipPreview
          v-if="canBeShownForPreviewType"
          :entity="entity"
        />
      </div>
    </template>
  </base-tooltip>
</template>

<script lang="ts" setup>
import {
  BaseEntity,
  PanelMetadataValueTooltip,
  PanelMetadataValueTooltipTypes,
  Metadata,
} from "@/generated-types/queries";
import { computed } from "vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import MetadataValueTooltipPreview from "./MetadataValueTooltipPreview.vue";
import { Unicons } from "@/types";

type BasicEntityWithMetadata = BaseEntity & { metadata: Metadata[] };

const props = defineProps<{
  valueTooltip: PanelMetadataValueTooltip;
  entity: BasicEntityWithMetadata;
}>();

const type = computed(() => {
  return props.valueTooltip.type;
});

const isPreviewType = computed(() => {
  return type.value === PanelMetadataValueTooltipTypes.Preview;
});

const isPlaneType = computed(() => {
  return type.value === PanelMetadataValueTooltipTypes.Plane;
});

const canBeShownForPreviewType = computed(() => {
  return isPreviewType.value && props.entity;
});

const canBeShownForPlaneType = computed(() => {
  return isPlaneType.value && props.valueTooltip.value;
});
</script>
