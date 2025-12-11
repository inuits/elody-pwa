<template>
  <MetadataFormatterLink
    v-if="formatterType === CustomFormatterTypes.Link && label"
    :formatter="formatter"
    :label="readableLabel"
    :link="link"
    :type="entity.type"
  />
  <MetadataFormatterPill
    v-if="formatterType === CustomFormatterTypes.Pill && label"
    :formatter="formatter"
    :label="readableLabel"
    :translation-key="translationKey"
  />
  <MetadataRegexpFormatter
    v-if="formatterType === CustomFormatterTypes.RegexpMatch && label"
    :formatter="formatter"
    :label="readableLabel"
  />
  <label v-if="!label">
    {{ readableLabel }}
  </label>
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
    link?: string;
    entity: any;
    translationKey?: string;
  }>(),
  {
    link: "",
  },
);

const formatterType = computed(() => {
  try {
    const [type] = props.formatter.split("|");
    return type;
  } catch {
    console.log(props);
  }
});

const readableLabel = computed(() => {
  const isLabelArray = Array.isArray(props.label);

  if (isLabelArray) {
    return props.label.length > 0 ? props.label.join(", ") : "-";
  }
  return props.label ? props.label : "-";
});
</script>
