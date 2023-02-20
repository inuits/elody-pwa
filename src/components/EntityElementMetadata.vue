<template>
  <span class="w-full">{{ metadata.label }}</span>
  <span class="w-full">{{ value }}</span>
</template>

<script lang="ts" setup>
import type { PanelMetaData } from "@/generated-types/queries";
import { useField } from "vee-validate";

const props = defineProps<{
  metadata: PanelMetaData;
}>();

const { value } = useField(props.metadata.key);
</script>
