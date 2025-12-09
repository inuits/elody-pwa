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
    await fetch(createUrl());
    await refetchParentEntity();
    displaySuccessNotification(
      t("notifications.success.entityUpdated.title"),
      t("notifications.success.entityUpdated.description"),
    );
  } catch {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      t("notifications.errors.validation-error.title"),
    );
  } finally {
    emit("toggleLoading");
  }
};

const createUrl = () => {
  return `/${props.endpointUrl.replace("$id", props.entityId)}`;
};
</script>
