<template>
  <div v-if="relation.value" class="text-sm pl-4">
    <p class="text-text-light w-full">{{ relation.label }}</p>
    <p class="w-full">{{ relation.value }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { PanelRelation } from "@/generated-types/queries";

const props = defineProps<{
  relation: PanelRelation;
}>();
</script>
