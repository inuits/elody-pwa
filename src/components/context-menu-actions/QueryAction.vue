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
import { useImport } from "@/composables/useImport";
import { inject } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  label: string;
  icon: string;
  query: string;
  refreshAfterAction?: boolean;
  entityId: string;
}>();

const { t } = useI18n();
const { loadDocument } = useImport();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const apolloClient = inject(DefaultApolloClient);
const refetchParentEntity: any = inject("RefetchParentEntity");

const doAction = async () => {
  try {
    const document = await loadDocument(props.query);
    await (apolloClient as ApolloClient<any>).query({
      query: document,
      variables: { id: props.entityId },
      fetchPolicy: "no-cache",
    });

    if (props.refreshAfterAction) {
      await refetchParentEntity();
    }

    displaySuccessNotification(
      t("notifications.success.entityUpdated.title"),
      t("notifications.success.entityUpdated.description"),
    );
  } catch {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      "",
    );
  }
};
</script>
