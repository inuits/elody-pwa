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
        <p
          data-cy="metadata-value"
          v-html="processTextWithLinks(t(linkText) || readableValue)"
          @click.stop
        ></p>
      </div>

      <p
        data-cy="metadata-value"
        v-else-if="stringIsHtml(readableValue)"
        v-html="readableValue"
      ></p>
      <p data-cy="metadata-value" v-else>
        {{ (readableValue as string) || "-" }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BaseLibraryModes, Unit } from "@/generated-types/queries";
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
    linkIcon?: string;
    baseLibraryMode?: BaseLibraryModes;
  }>(),
  {
    linkText: "",
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  }
);

const { t } = useI18n();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});
</script>
