<template>
  <base-context-menu-item
    @clicked="doAction"
    :label="$t(label)"
    :icon="Unicons[icon].name"
  />
</template>

<script setup lang="ts">
import { ContextMenuGeneralActionEnum } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { inject } from "vue";

const emit = defineEmits(["toggleLoading"]);
const refetchParentEntity: any = inject("RefetchParentEntity");

const props = defineProps<{
  label: string;
  icon: string;
  action: ContextMenuGeneralActionEnum;
  entityId: string;
  endpointUrl: string;
  endpointMethod: string;
}>();
const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();

const doAction = async () => {
  try {
    displaySuccessNotification(
      t("notifications.success.action-started.title"),
      t("notifications.success.action-started.description"),
    );

const response = await fetch(createUrl(), {
      method: props.endpointMethod.toUpperCase() || "GET", // Good practice to ensure it's uppercase
      headers: {
        'Content-Type': 'application/json',
      },
      // If it's a POST/PUT, you'd likely add: body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    await refetchParentEntity();

    displaySuccessNotification(
      t("notifications.success.entityUpdated.title"),
      t("notifications.success.entityUpdated.description"),
    );
  } catch (error) {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      "",
    );
  } finally {
    emit("toggleLoading");
  }
};

const createUrl = () => {
  return `/${props.endpointUrl.replace("$id", props.entityId)}`;
};
</script>
