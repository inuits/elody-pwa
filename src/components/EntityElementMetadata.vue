<template>
  <div class="text-sm pl-4">
    <p class="text-text-light w-full">{{ label }}</p>
    <p class="w-full">{{ readableValue || "-" }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { Unit } from "@/generated-types/queries";
import { convertUnitToReadbleFormat } from "@/helpers";
import { computed } from "vue";

const props = defineProps<{
  label?: string;
  value?: string;
  unit?: string;
}>();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});
</script>
