<template>
  <div
    :class="[
      'rounded-md border-2 border-solid p-2 flex flex-col gap-2',
      changedClass,
    ]"
  >
    <metadata-title :metadata="metadataForTitle" />
    <sanitized-html :mode="SanitizeMode.Html" :content="content" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import type { TranslationEntry } from "@/composables/useMultilingualField";
import { SanitizeMode, type WysiwygElement } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    formId: string;
    element: WysiwygElement;
    changed?: boolean;
    colorVariant?: "current" | "previous";
  }>(),
  { changed: false, colorVariant: "current" },
);

const changedClass = computed(() => {
  if (!props.changed) return "border-neutral-30 bg-background-light";
  return props.colorVariant === "previous"
    ? "border-red-400 bg-red-50"
    : "border-green-400 bg-green-50";
});

const { getForm } = useFormHelper();
const { locale } = useI18n();

const metadataForTitle = computed(() => ({
  ...props.element,
  infoPanel: undefined,
}));

const content = computed<string>(() => {
  const rawValue =
    getForm(props.formId)?.values?.intialValues?.[props.element.metadataKey];
  if (Array.isArray(rawValue)) {
    const entry = (rawValue as TranslationEntry[]).find(
      (translation) => translation?.lang === locale.value,
    );
    return entry?.value ?? "";
  }
  return rawValue ?? "";
});
</script>
