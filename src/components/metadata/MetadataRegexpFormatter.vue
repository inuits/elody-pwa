<template>
  <!-- <div
    class="rounded-md bg-slate-800 py-0.25 px-1 border border-transparent text-sm"
    :style="{
      background: pillSettings.background,
      color: pillSettings.text,
    }"
  >
    {{ label }}
  </div> -->
  <div>
    !!!regexp formatter!!!
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
  const [formatterType, pillType] = props.formatter.split("|");
  return formattersSettings[formatterType][pillType];
});
</script>
