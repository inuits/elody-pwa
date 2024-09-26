<template>
  <a
    class="text-sm break-words underline"
    v-if="formatterType === CustomFormatterTypes.Link"
    target="_blank"
    :href="link"
    >{{ readableLabel }}</a
  >
  <template v-if="formatterType === CustomFormatterTypes.Pill">
    <div
      class="rounded-md bg-slate-800 py-0.25 px-1 border border-transparent text-sm"
      :style="{
        background: pillSettings.background,
        color: pillSettings.text,
      }"
    >
      {{ readableLabel }}
    </div>
  </template>
</template>

<script lang="ts" setup>
import { CustomFormatterTypes } from "@/generated-types/queries";
import { formattersSettings } from "@/main";

import { computed } from "vue";
const props = defineProps<{
  formatter: string;
  label?: any;
  link?: any;
}>();

const formatterType = computed(() => {
  const [type] = props.formatter.split("|");
  return type;
});

const readableLabel = computed(() => {
  return Array.isArray(props.label) ? props.label.join(", ") : props.label;
});

const pillSettings = computed(() => {
  if (formatterType.value !== CustomFormatterTypes.Pill) return;

  const [, type] = props.formatter.split("|");
  return formattersSettings[formatterType.value][type];
});
</script>
