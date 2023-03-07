<template>
  <div class="text-sm pl-4">
    <span class="text-text-light w-full">{{ metadata.label }}</span>
    <span class="w-full">{{ value }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { PanelMetaData } from "@/generated-types/queries";
import { useField } from "vee-validate";

const props = defineProps<{
  metadata: PanelMetaData;
}>();

const { value } = useField(props.metadata.key);
</script>
