<template>
  <div class="cursor-pointer" ref="copyButton" @click.stop.prevent="copyToClipboard">
    <unicon :name="Unicons.Copy.name" @click.stop.prevent="copyToClipboard" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Clipboard from "clipboard";
import { Unicons } from "@/types";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useI18n } from "vue-i18n";

const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
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
      displaySuccessNotification(
        t("notifications.success.copiedToClipboard.title"),
        t("notifications.success.copiedToClipboard.description"),
      );
    });

    clipboardInstance.on("error", () => {
      displayErrorNotification(
        t("notifications.errors.copiedToClipboard.title"),
        t("notifications.errors.copiedToClipboard.description"),
      );
    });
  }
});

onUnmounted(() => {
  clipboardInstance?.destroy();
});
</script>
