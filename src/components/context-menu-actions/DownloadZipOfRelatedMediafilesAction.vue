<template>
  <base-context-menu-item
    @clicked="doAction"
    :label="$t(label)"
    :icon="Unicons[icon].name"
  />
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  label: string;
  icon: string;
  endpointUrl: string;
  endpointMethod: string;
  filename?: string | null;
  entityId: string;
}>();

const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();

const resolveFilename = (response: Response): string => {
  if (props.filename) return props.filename;
  const disposition = response.headers.get("Content-Disposition");
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
    if (match) return decodeURIComponent(match[1].replace(/"/g, ""));
  }
  return "download.zip";
};

const createUrl = (): string => {
  return `/${props.endpointUrl.replace("$id", props.entityId)}`;
};

const doAction = async () => {
  try {
    const response = await fetch(createUrl(), {
      method: props.endpointMethod?.toUpperCase() || "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const filename = resolveFilename(response);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    displaySuccessNotification(
      t("notifications.success.action-started.title"),
      t("notifications.success.action-started.description"),
    );
  } catch {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      "",
    );
  }
};
</script>
