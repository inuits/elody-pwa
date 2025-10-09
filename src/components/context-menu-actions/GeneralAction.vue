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
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";
import EventBus from "@/EventBus";
import { useFormHelper } from "@/composables/useFormHelper";

const emit = defineEmits(["toggleLoading"]);

const props = defineProps<{
  label: string;
  icon: string;
  action: ContextMenuGeneralActionEnum;
  entityId: string;
  parentEntityId: string;
}>();
const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { loadDocument } = useImport();
const { getForm } = useFormHelper();
const form = getForm(props.parentEntityId);

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
      .then((result: any) => {
        displaySuccessNotification(
          t("notifications.success.entityUpdated.title"),
          t("notifications.success.entityUpdated.description"),
        );
        setNewEntityValues(result);
        EventBus.emit(props.action);
      });
  } catch {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      t("notifications.errors.validation-error.title"),
    );
  } finally {
    emit("toggleLoading");
  }
};

const createVariables = () => {
  if (
    props.action === ContextMenuGeneralActionEnum.SetPrimaryMediafile ||
    props.action === ContextMenuGeneralActionEnum.SetPrimaryThumbnail
  ) {
    return {
      entityId: props.parentEntityId,
      mediafileId: props.entityId,
    };
  }
};

const setNewEntityValues = (result): void => {
  if (!form) {
    console.error(
      `Unable to update entity values, form with id ${props.parentEntityId} does not exist`,
    );
    return;
  }
  const updatedEntity =
    result.data.setPrimaryMediafile || result.data.setPrimaryThumbnail;
  form.setValues({
    intialValues: updatedEntity.intialValues,
    relationValues: updatedEntity.relationValues,
  });
  console.log(form.values);
};
</script>
