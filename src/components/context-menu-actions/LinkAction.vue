<template>
  <router-link
    :to="{ params: { id: entityId, type: entityType } }"
    target="_blank"
  >
    <base-context-menu-item :label="$t(label)" :icon="Unicons[icon].name" />
  </router-link>
</template>

<script setup lang="ts">
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { Unicons } from "@/types";
import { Entitytyping } from "@/generated-types/queries";

const props = defineProps<{
  label: String;
  icon: String;
  entityId: String;
  entityType: Entitytyping;
}>();
</script>
