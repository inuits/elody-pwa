<template>
  <div v-if="value" class="text-sm pl-4">
    <p class="text-text-light w-full">{{ metadata.label }}</p>
    <p class="w-full">{{ value }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { PanelMetaData, PanelRelation } from "@/generated-types/queries";
import { useField } from "vee-validate";

const props = defineProps<{
  metadata: PanelMetaData;
}>();

const { value } = useField(props.metadata.key);
</script>
