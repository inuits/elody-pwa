<template>
  <span
    class="inline-flex items-center gap-1"
    :data-copied="copied.visible.value ? '' : undefined"
  >
    <button
      type="button"
      data-cy="copy-value"
      :aria-label="label('copy', 'Copy')"
      class="inline-flex rounded-button p-(--button-sm-padding-icon) text-text-subtle hover:bg-accent-wash"
      @click.stop.prevent="copyToClipboard"
    >
      <unicon
        :name="copied.visible.value ? Unicons.Check.name : Unicons.Copy.name"
        height="14"
        aria-hidden="true"
      />
    </button>
    <span role="status" class="text-hint text-text-muted">
      {{ copied.visible.value ? label("copied", "Copied") : "" }}
    </span>
  </span>
</template>

<script setup lang="ts">
import Clipboard from "clipboard";
import { Unicons } from "@/types";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useSavedFlash } from "@/composables/useSavedFlash";
import { useI18n } from "vue-i18n";

const { displayErrorNotification } = useBaseNotification();
const { t, te } = useI18n();
const copied = useSavedFlash();

const props = defineProps<{
  value: any;
}>();

const label = (key: string, fallback: string): string =>
  te(`copy-to-clipboard.${key}`) ? t(`copy-to-clipboard.${key}`) : fallback;

const normalizeValue = (value: any) => {
  const isCoordinates =
    value?.hasOwnProperty("latitude") && value?.hasOwnProperty("longitude");

  return isCoordinates ? `${value.latitude}, ${value.longitude}` : value;
};

const copyToClipboard = () => {
  try {
    Clipboard.copy(String(normalizeValue(props.value) ?? ""));
    copied.flash();
  } catch {
    displayErrorNotification(
      t("notifications.errors.copiedToClipboard.title"),
      t("notifications.errors.copiedToClipboard.description"),
    );
  }
};
</script>
