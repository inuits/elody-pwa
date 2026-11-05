<template>
  <slot />
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import type { Entity } from "@/generated-types/queries";

const props = defineProps<{ entity: Entity }>();

provide(
  "ParentEntityProvider",
  computed(() => props.entity),
);
</script>
