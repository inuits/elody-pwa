<template>
  <MetadataFormatterLink
    v-if="formatterType === CustomFormatterTypes.Link && hasLabel"
    :formatter="formatter"
    :label="readableLabel"
    :link="link"
    :type="entity?.type"
    :open-in-new-tab="openInNewTab"
  />
  <MetadataFormatterPill
    v-if="formatterType === CustomFormatterTypes.Pill && hasLabel"
    :formatter="formatter"
    :label="pillLabel"
    :translation-key="pillTranslationKey"
  />
  <MetadataRegexpFormatter
    v-if="formatterType === CustomFormatterTypes.RegexpMatch && hasLabel"
    :formatter="formatter"
    :label="readableLabel"
  />
  <!-- Design system: empty values render "Geen waarde" at 45% opacity,
       never "-" (deprecated). -->
  <label v-if="!hasLabel" class="opacity-45">
    {{ readableLabel }}
  </label>
</template>

<script lang="ts" setup>
import { CustomFormatterTypes, type Unit } from "@/generated-types/queries";
import MetadataFormatterLink from "./MetadataFormatterLink.vue";
import MetadataFormatterPill from "./MetadataFormatterPill.vue";
import MetadataRegexpFormatter from "./MetadataRegexpFormatter.vue";
import { computed } from "vue";
import { convertUnitToReadbleFormat } from "@/helpers";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string | string[];
    link?: string;
    entity?: any;
    translationKey?: string;
    openInNewTab?: boolean;
    unit?: string;
  }>(),
  {
    link: "",
    openInNewTab: false,
    unit: "",
  },
);

const { t, te } = useI18n();

const formatterType = computed(() => {
  const [type] = props.formatter.split("|");
  return type;
});

const translateArrayValuesAndJoin = (values: string[], translationKey: string): string =>
  values
    .map((item) => {
      const key = translationKey.replace("$value", item);
      const translated = t(key);
      return translated !== key ? translated : item;
    })
    .join(", ");

const hasLabel = computed(() =>
  Array.isArray(props.label) ? props.label.length > 0 : Boolean(props.label),
);

const noValueLabel = computed(() =>
  te("metadata.labels.no-value") ? t("metadata.labels.no-value") : "Geen waarde",
);

const readableLabel = computed(() => {
  if (Array.isArray(props.label)) {
    if (props.label.length === 0) return noValueLabel.value;
    if (props.translationKey) return translateArrayValuesAndJoin(props.label, props.translationKey);
    return props.label.join(", ");
  }
  return props.label
    ? convertUnitToReadbleFormat(props.unit as Unit, props.label ?? "")
    : noValueLabel.value;
});

// A single-value pill translates its own display value from translationKey, so it needs
// the raw (untranslated) value to look up its colors by. An array can only be translated
// per element, which the pill cannot do on a joined string — hand it the finished text.
const pillLabel = computed(() =>
  Array.isArray(props.label) ? readableLabel.value : props.label,
);

const pillTranslationKey = computed(() =>
  Array.isArray(props.label) ? undefined : props.translationKey,
);
</script>
