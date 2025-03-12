<template>
  <div ref="copyButton" @click.stop.prevent="copyToClipboard">
    <unicon :name="Unicons.Copy.name" @click.stop.prevent="copyToClipboard" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Clipboard from "clipboard";
import { Unicons } from "@/types";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useI18n } from "vue-i18n";

const { createNotificationOverwrite } = useNotification();
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
      createNotificationOverwrite(
        NotificationType.default,
        t("notifications.success.copiedToClipboard.title"),
        t("notifications.success.copiedToClipboard.description"),
        3,
      );
    });

    clipboardInstance.on("error", () => {
      console.error("Copy failed");
    });
  }
});

onUnmounted(() => {
  clipboardInstance?.destroy();
});
</script>
