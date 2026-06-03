<template>
  <base-info-panel
    v-if="activePanel"
    :title="activePanel.title"
    :content="activePanel.content"
    @close="closePanel"
  />
</template>

<script setup lang="ts">
import BaseInfoPanel from "@/components/base/BaseInfoPanel.vue";
import { useInfoPanel } from "@/composables/useInfoPanel";

const { activePanel, closePanel } = useInfoPanel();
</script>
