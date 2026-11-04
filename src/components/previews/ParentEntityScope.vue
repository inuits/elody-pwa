<template>
  <slot />
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import type { Entity } from "@/generated-types/queries";

// Relation fields resolve `$relationValues...` against the injected parent; scope it to `entity` for the slot.
const props = defineProps<{ entity: Entity }>();

provide(
  "ParentEntityProvider",
  computed(() => props.entity),
);
</script>
