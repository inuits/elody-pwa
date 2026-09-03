<template>
  <div class="flex gap-2 items-center">
    <span data-cy="metadata-masked-value" class="text-sm break-all">
      <template v-if="isFetching">{{
        t("metadata.labels.loading-value")
      }}</template>
      <template v-else-if="isUnavailable">{{
        t("metadata.labels.value-unavailable")
      }}</template>
      <template v-else>{{ displayValue }}</template>
    </span>
    <button
      v-if="hasValueToShow"
      type="button"
      class="cursor-pointer w-6 h-6"
      :title="toggleLabel"
      :aria-label="toggleLabel"
      :disabled="isFetching"
      data-cy="metadata-masked-toggle"
      @click.stop.prevent="toggle"
    >
      <unicon :name="isRevealed ? Unicons.EyeSlash.name : Unicons.Eye.name" />
    </button>
    <BaseCopyToClipboard
      v-if="copyToClipboard && isRevealed && !isUnavailable"
      class="w-6 h-6"
      :value="displayValue"
      @click.stop.prevent
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    metadataKey: string;
    value?: any;
    revealQuery?: string;
    entityId?: string;
    copyToClipboard?: boolean;
    maskLength?: number;
  }>(),
  { maskLength: 12 },
);

const { t } = useI18n();
const { loadDocument } = useImport();

const isRevealed = ref(false);
const isFetching = ref(false);
const isUnavailable = ref(false);
const fetchedValue = ref<string | undefined>(undefined);

const mask = computed(() => "•".repeat(props.maskLength));
const hasValueToShow = computed(() =>
  props.revealQuery ? true : Boolean(props.value),
);

const displayValue = computed(() => {
  if (!isRevealed.value) return mask.value;
  return props.revealQuery ? (fetchedValue.value ?? "") : props.value;
});

const toggleLabel = computed(() =>
  t(
    isRevealed.value
      ? "metadata.labels.hide-value"
      : "metadata.labels.show-value",
  ),
);

const fetchValue = async (): Promise<void> => {
  if (fetchedValue.value !== undefined) return;
  isFetching.value = true;
  isUnavailable.value = false;
  try {
    const document = await loadDocument(props.revealQuery as string);
    const { data } = await apolloClient.query({
      query: document,
      variables: { id: props.entityId },
      fetchPolicy: "no-cache",
    });
    const entity = Object.values(data ?? {})[0] as any;
    const value = entity?.intialValues?.[props.metadataKey] ?? "";
    if (!value) isUnavailable.value = true;
    else fetchedValue.value = value;
  } catch {
    isUnavailable.value = true;
  } finally {
    isFetching.value = false;
  }
};

const toggle = async (): Promise<void> => {
  if (isRevealed.value) {
    isRevealed.value = false;
    isUnavailable.value = false;
    return;
  }
  if (props.revealQuery) await fetchValue();
  isRevealed.value = true;
};
</script>
