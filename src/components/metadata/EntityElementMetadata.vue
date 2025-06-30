<template>
  <div
    data-cy="entity-element-metadata"
    v-if="baseLibraryMode === BaseLibraryModes.NormalBaseLibrary"
    class="text-sm break-words"
  >
    <div v-if="Array.isArray(readableValue)">
      <div v-for="item in readableValue" :key="item">
        <p data-cy="metadata-value" v-if="!stringIsUrl(item)">{{ item }}</p>
        <a v-else class="underline" target="_blank" :href="item">{{
          t(linkText) || item
        }}</a>
      </div>
      <div v-if="readableValue.length == 0">-</div>
    </div>
    <div v-else-if="isCoordinates">
      {{ `(${value.latitude}, ${value.longitude})` }}
    </div>
    <div v-else-if="customValue">
      {{ customValue }}
    </div>
    <div v-else>
      <div class="flex items-center" v-if="stringIsUrl(readableValue)">
        <div v-if="(linkIcon && Unicons[linkIcon]) || linkIcon" class="pr-2">
          <unicon
            v-if="linkIcon && Unicons[linkIcon]"
            :name="Unicons[linkIcon].name"
            height="12"
          />
          <CustomIcon v-else-if="linkIcon" :icon="linkIcon" :size="12" />
        </div>
        <a
          data-cy="metadata-value"
          class="underline"
          target="_blank"
          :href="readableValue"
          v-html="processTextWithLinks(t(linkText) || readableValue)"
          @click.stop
        ></a>
      </div>

      <p
        data-cy="metadata-value"
        v-else-if="stringIsHtml(readableValue)"
        v-html="readableValue"
      ></p>
      <p v-else data-cy="metadata-value">
        {{ displayValue }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Unit } from "@/generated-types/queries";
import { BaseLibraryModes } from "@/generated-types/queries";
import {
  convertUnitToReadbleFormat,
  processTextWithLinks,
  stringIsHtml,
  stringIsUrl,
} from "@/helpers";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import CustomIcon from "@/components/CustomIcon.vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    value?: any;
    unit?: string;
    linkText?: string;
    customValue?: string;
    linkIcon?: string;
    baseLibraryMode?: BaseLibraryModes;
    translationKey?: string;
  }>(),
  {
    linkText: "",
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  },
);

const { t } = useI18n();

const isCoordinates = computed(() => {
  return (
    props.value?.hasOwnProperty("latitude") &&
    props.value?.hasOwnProperty("longitude")
  );
});

const readableValue = computed(() => {
  if (isCoordinates.value) return {};
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});

const displayValue = computed(() => {
  if (isCoordinates.value) return readableValue.value;

  if (readableValue.value === "") return "-";
  if (Array.isArray(readableValue.value)) return readableValue.value;

  if (props.translationKey) {
    const key = props.translationKey;
    const normalizedTranslationKey = key.replace(
      "$value",
      String(readableValue.value),
    );
    const translated = t(normalizedTranslationKey);
    if (translated !== normalizedTranslationKey) return translated;
  }

  return readableValue.value;
});
</script>
