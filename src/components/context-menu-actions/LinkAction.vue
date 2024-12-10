<template>
  <router-link
    :to="{ params: { id: entityId, type: typeUrlMapping?.mapping[entityType] || entityType } }"
    target="_blank"
    @click.stop
  >
    <base-context-menu-item :label="$t(label)" :icon="Unicons[icon].name" />
  </router-link>
</template>

<script setup lang="ts">
import type { Entitytyping } from "@/generated-types/queries";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { typeUrlMapping } from "@/main";
import { Unicons } from "@/types";

defineProps<{
  label: String;
  icon: String;
  entityId: String;
  entityType: Entitytyping;
}>();
</script>
