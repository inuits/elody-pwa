<template>
  <div ref="copyButton" @click.stop.prevent="copyToClipboard">
    <unicon :name="Unicons.Copy.name" @click.stop.prevent="copyToClipboard" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Clipboard from "clipboard";
import { Unicons } from "@/types";
import { useNotification } from "@kyvg/vue3-notification";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useI18n } from "vue-i18n";

const { notify } = useNotification();
const { getSuccessNotification, getErrorNotification } = useBaseNotification();
const { t } = useI18n();

const props = defineProps<{
  value: any;
}>();

const copyButton = ref(null);
let clipboardInstance: any = null;

const copyToClipboard = () => {
  if (!clipboardInstance) return;
  clipboardInstance.onClick({ currentTarget: copyButton.value });
};

const normalizeValue = (value: any) => {
  const isCoordinates =
    value?.hasOwnProperty("latitude") && value?.hasOwnProperty("longitude");

  return isCoordinates ? `${value.latitude}, ${value.longitude}` : value;
};

onMounted(() => {
  if (props.value) {
    clipboardInstance = new Clipboard(copyButton.value, {
      text: () => normalizeValue(props.value),
    });

    clipboardInstance.on("success", () => {
      notify(
        getSuccessNotification(
          t("notifications.success.copiedToClipboard.title"),
          t("notifications.success.copiedToClipboard.description"),
        ),
      );
    });

    clipboardInstance.on("error", () => {
      notify(
        getErrorNotification(
          t("notifications.errors.copiedToClipboard.title"),
          t("notifications.errors.copiedToClipboard.description"),
        ),
      );
    });
  }
});

onUnmounted(() => {
  clipboardInstance?.destroy();
});
</script>
