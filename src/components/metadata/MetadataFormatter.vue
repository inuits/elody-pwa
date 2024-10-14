<template>
  <MetadataFormatterLink
    v-if="formatterType === CustomFormatterTypes.Link"
    :formatter="formatter"
    :label="readableLabel"
    :link="link"
  />
  <MetadataFormatterPill
    v-if="formatterType === CustomFormatterTypes.Pill"
    :formatter="formatter"
    :label="readableLabel"
  />
  <MetadataRegexpFormatter
    v-if="formatterType === CustomFormatterTypes.Regexp"
    :formatter="formatter"
    :label="readableLabel"
  />
</template>

<script lang="ts" setup>
import { CustomFormatterTypes } from "@/generated-types/queries";
import MetadataFormatterLink from "./MetadataFormatterLink.vue";
import MetadataFormatterPill from "./MetadataFormatterPill.vue";
import MetadataRegexpFormatter from "./MetadataRegexpFormatter.vue";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string | string[];
    link: string;
  }>(),
  {
    link: "",
  }
);

const formatterType = computed(() => {
  const [type] = props.formatter.split("|");
  return type;
});

const readableLabel = computed(() => {
  return Array.isArray(props.label) ? props.label.join(", ") : props.label;
});
</script>
