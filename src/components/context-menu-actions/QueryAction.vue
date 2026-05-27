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
import { useRouter } from "vue-router";

const props = defineProps<{
  label: string;
  icon: string;
  query: string;
  refreshAfterAction?: boolean;
  navigateToCreatedEntity?: boolean;
  entityId: string;
}>();

const { t } = useI18n();
const { loadDocument } = useImport();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const apolloClient = inject(DefaultApolloClient);
const refetchParentEntity: any = inject("RefetchParentEntity");
const router = useRouter();

const doAction = async () => {
  try {
    const document = await loadDocument(props.query);
    const isMutation =
      document.definitions[0]?.kind === "OperationDefinition" &&
      (document.definitions[0] as any).operation === "mutation";
    let result;
    if (isMutation) {
      result = await (apolloClient as ApolloClient<any>).mutate({
        mutation: document,
        variables: { id: props.entityId },
      });
    } else {
      result = await (apolloClient as ApolloClient<any>).query({
        query: document,
        variables: { id: props.entityId },
        fetchPolicy: "no-cache",
      });
    }

    if (props.refreshAfterAction) {
      await refetchParentEntity();
    }

    if (props.navigateToCreatedEntity) {
      const createdEntity = result?.data
        ? (Object.values(result.data)[0] as any)
        : undefined;
      if (createdEntity?.uuid) {
        router.push({
          name: "SingleEntity",
          params: { id: createdEntity.uuid, type: createdEntity.type },
        });
        return;
      }
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
