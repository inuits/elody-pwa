<template>
  <base-context-menu-item
    @clicked="doAction"
    :label="$t(label)"
    :icon="Unicons[icon].name"
    :as-button="asButton"
  />
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useImport } from "@/composables/useImport";
import { useFormHelper } from "@/composables/useFormHelper";
import { EditStatus } from "@/generated-types/queries";
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
  relationTypesToExtract?: string[];
  asButton?: boolean;
}>();

const { t } = useI18n();
const { loadDocument } = useImport();
const { getRelationsBasedOnType } = useFormHelper();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const apolloClient = inject(DefaultApolloClient);
const refetchParentEntity: any = inject("RefetchParentEntity");
const router = useRouter();

const buildVariables = () => {
  const variables: Record<string, unknown> = { id: props.entityId };
  if (props.relationTypesToExtract?.length) {
    variables.relations = props.relationTypesToExtract
      .flatMap((type) => getRelationsBasedOnType(props.entityId, type) ?? [])
      .map((relation) => ({ ...relation, editStatus: EditStatus.Unchanged }));
  }
  return variables;
};

const navigationTargetOf = (
  entity: any,
): { id: string; type: string } | undefined => {
  const { navigate_to_id: id, navigate_to_type: type } =
    entity?.intialValues ?? {};
  if (id && type) return { id, type };
  if (entity?.uuid) return { id: entity.uuid, type: entity.type };
  return undefined;
};

const doAction = async () => {
  try {
    const document = await loadDocument(props.query);
    const isMutation =
      document.definitions[0]?.kind === "OperationDefinition" &&
      (document.definitions[0] as any).operation === "mutation";
    const variables = buildVariables();
    let result;
    if (isMutation) {
      result = await (apolloClient as ApolloClient<any>).mutate({
        mutation: document,
        variables,
      });
    } else {
      result = await (apolloClient as ApolloClient<any>).query({
        query: document,
        variables,
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
      const navigationTarget = navigationTargetOf(createdEntity);
      if (navigationTarget) {
        router.push({ name: "SingleEntity", params: navigationTarget });
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
