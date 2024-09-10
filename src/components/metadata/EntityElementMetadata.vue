<template>
  <div
    ref="elementMetadata"
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
import {
  convertUnitToReadbleFormat,
  processTextWithLinks,
  stringIsHtml,
  stringIsUrl,
} from "@/helpers";
import CustomIcon from "@/components/CustomIcon.vue";
import { BaseLibraryModes, Unit } from "@/generated-types/queries";
import { computed, onMounted, ref } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useLoadingState, Loader, LoadingElement } from "@/composables/useLoadingState";

const props = withDefaults(
  defineProps<{
    label?: string;
    value?: any;
    unit?: string;
    linkText?: string;
    linkIcon?: string;
    baseLibraryMode?: BaseLibraryModes;
    lineClamp?: boolean;
  }>(),
  {
    linkText: "",
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    lineClamp: false
  }
);

const { t } = useI18n();
const { finishLoadingElement } = useLoadingState();
const elementMetadata = ref<HTMLDivElement>();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});

onMounted(() => {
  if (props.lineClamp)
    setTimeout(() => {
      const valueElement: HTMLParagraphElement | undefined | null = elementMetadata.value?.querySelector("[data-cy='metadata-value']");
      if (valueElement && valueElement?.offsetHeight > 20)
        valueElement.classList.add("line-clamp-1");
      finishLoadingElement(Loader.BaseLibrary, LoadingElement.UI);
    }, 0);
});
</script>
