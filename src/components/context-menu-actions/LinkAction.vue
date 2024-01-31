<template>
  <router-link
    :to="{ name: props.action, params: { id: entityId }}"
    target="_blank"
  >
    <base-context-menu-item
      :label="$t(label)"
      :icon="Unicons.AngleRight.name"
    />
  </router-link>
</template>

<script setup lang="ts">
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { Unicons } from "@/types";

const props = defineProps<{
  label: String;
  action: Boolean;
  entityId: String;
}>();
</script>