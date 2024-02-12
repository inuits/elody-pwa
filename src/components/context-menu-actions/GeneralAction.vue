<template>
  <base-context-menu-item
    @clicked="doGeneralAction()"
    :label="$t(label)"
    :icon="Unicons[icon].name"
  />
</template>

<script setup lang="ts">
import { ContextMenuGeneralActionEnum } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { NotificationType } from "@/components/base/BaseNotification.vue";
import { useNotification } from "@/components/base/BaseNotification.vue";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";

const emit = defineEmits(["toggleLoading"]);

const props = defineProps<{
  label: String;
  icon: String;
  action: ContextMenuGeneralActionEnum;
  entityId: String;
  parentEntityId: String;
}>();
const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { loadDocument } = useImport();

const doGeneralAction = async () => {
  const document = await loadDocument(props.action);
  try {
    await apolloClient
      .query({
        query: document,
        variables: createVariables(),
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then(() => {
        createNotificationOverwrite(
          NotificationType.default,
          t("notifications.success.entityUpdated.title"),
          t("notifications.success.entityUpdated.description")
        );
      });
  } catch (e) {
    createNotificationOverwrite(
      NotificationType.error,
      t("notifications.errors.validation-error.title"),
      t("notifications.errors.validation-error.title")
    );
  } finally {
    emit("toggleLoading");
  }
};

const createVariables = () => {
  if (
    props.action === ContextMenuGeneralActionEnum.SetPrimaryMediafile ||
    props.action === ContextMenuGeneralActionEnum.SetPrimaryThumbnail
  )
    return {
      entityId: props.parentEntityId,
      mediafileId: props.entityId,
    };
};
</script>
