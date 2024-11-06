<template>
  <div
    class="text-sm"
    :class="{
      'rounded-md bg-slate-800 py-0.25 px-1 mt-1 border border-transparent': pillSettings
    }"
    :style="{
      background: pillSettings?.background,
      color: pillSettings?.text,
    }"
  >
    {{ label }}
  </div>
</template>

<script lang="ts" setup>
import { formattersSettings } from "@/main";

import { computed } from "vue";
const props = defineProps<{
  formatter: string;
  label: string;
}>();

const pillSettings = computed(() => {
  let [formatterType, pillType] = props.formatter.split("|");
  if (!pillType) pillType = props.label.toLowerCase();
  return formattersSettings[formatterType][pillType];
});
</script>
