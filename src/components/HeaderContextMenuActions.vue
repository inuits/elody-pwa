<template>
  <context-menu-actions-shell
    :has-promoted-actions="hasPromotedActions"
    :has-overflow-actions="hasOverflowActions"
  >
    <template #promoted>
      <template v-for="(action, i) in promotedActions" :key="i">
        <elody-action
          v-if="action.type === 'elody'"
          :label="action.label"
          :icon="action.icon"
          :action="action.action"
          :entity-type="entityType"
          :entity-id="entityId"
          :parent-entity-id="entityId"
          :form-query="action.formQuery"
          :type-modal="action.typeModal"
          :form-flow="action.formFlow"
          :form-title="action.formTitle"
          :form-relation-type="action.formRelationType"
          :relation="undefined"
          :bulk-operations-context="undefined"
          :refetch-entities="noOp"
          :as-button="true"
        />
        <link-action
          v-else-if="action.type === 'link'"
          :label="action.label"
          :icon="action.icon"
          :entity-id="entityId"
          :entity-type="entityType"
          :route-name="action.routeName"
          :open-in-new-tab="action.openInNewTab"
          :as-button="true"
        />
      </template>
    </template>
    <template #overflow>
      <template v-for="(action, i) in overflowActions" :key="i">
        <elody-action
          v-if="action.type === 'elody'"
          :label="action.label"
          :icon="action.icon"
          :action="action.action"
          :entity-type="entityType"
          :entity-id="entityId"
          :parent-entity-id="entityId"
          :form-query="action.formQuery"
          :type-modal="action.typeModal"
          :form-flow="action.formFlow"
          :form-title="action.formTitle"
          :form-relation-type="action.formRelationType"
          :relation="undefined"
          :bulk-operations-context="undefined"
          :refetch-entities="noOp"
        />
        <download-zip-of-related-mediafiles-action
          v-else-if="action.type === 'downloadZip'"
          :label="action.label"
          :icon="action.icon"
          :endpoint-url="action.endpointUrl"
          :endpoint-method="action.endpointMethod"
          :filename="action.filename"
          :entity-id="entityId"
        />
        <query-action
          v-else-if="action.type === 'query'"
          :label="action.label"
          :icon="action.icon"
          :query="action.query"
          :refresh-after-action="action.refreshAfterAction"
          :navigate-to-created-entity="action.navigateToCreatedEntity"
          :entity-id="entityId"
        />
        <link-action
          v-else-if="action.type === 'link'"
          :label="action.label"
          :icon="action.icon"
          :entity-id="entityId"
          :entity-type="entityType"
          :route-name="action.routeName"
          :open-in-new-tab="action.openInNewTab"
        />
        <general-action
          v-else-if="action.type === 'general'"
          :label="action.label"
          :icon="action.icon"
          :action="action.action"
          :parent-entity-id="entityId"
          :entity-id="entityId"
        />
        <custom-action
          v-else-if="action.type === 'custom'"
          :label="action.label"
          :icon="action.icon"
          :action="action.action"
          :entity-id="entityId"
          :endpoint-url="action.endpointUrl"
          :endpoint-method="action.endpointMethod"
        />
        <export-csv-related-action
          v-else-if="action.type === 'exportCsvRelated'"
          :label="action.label"
          :icon="action.icon"
          :entity-id="entityId"
          :entity-type="action.entityType"
          :parent-relation="action.parentRelation"
        />
      </template>
    </template>
  </context-menu-actions-shell>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, provide } from "vue";
import type { Entitytyping } from "@/generated-types/queries";
import type { ContextMenuActionRouteConfig } from "@/types/contextMenuRouteConfig";
import ContextMenuActionsShell from "@/components/ContextMenuActionsShell.vue";
import ElodyAction from "@/components/context-menu-actions/ElodyAction.vue";
import DownloadZipOfRelatedMediafilesAction from "@/components/context-menu-actions/DownloadZipOfRelatedMediafilesAction.vue";
import QueryAction from "@/components/context-menu-actions/QueryAction.vue";
import LinkAction from "@/components/context-menu-actions/LinkAction.vue";
import GeneralAction from "@/components/context-menu-actions/GeneralAction.vue";
import CustomAction from "@/components/context-menu-actions/CustomAction.vue";
import ExportCsvRelatedAction from "@/components/context-menu-actions/ExportCsvRelatedAction.vue";
import {
  usePermissions,
  advancedPermissions,
} from "@/composables/usePermissions";
import { useFormHelper } from "@/composables/useFormHelper";

const props = defineProps<{
  actions: ContextMenuActionRouteConfig[];
  entityId: string;
  entityType: Entitytyping;
}>();

const { getForm } = useFormHelper();

const entityMetadata = computed<Record<string, unknown>>(
  () =>
    (getForm(props.entityId)?.values?.intialValues as Record<
      string,
      unknown
    >) ?? {},
);

const isHiddenForMetadata = (
  action: ContextMenuActionRouteConfig,
): boolean => {
  const condition = action.hideForMetadata;
  if (!condition) return false;
  return String(entityMetadata.value[condition.key]) === String(condition.equals);
};

const noOp = () => Promise.resolve();

provide("RefetchParentEntity", noOp);

const { fetchAdvancedPermission, setExtraVariables, createPermissionCacheKey } =
  usePermissions();

const promotedActions = ref<ContextMenuActionRouteConfig[]>([]);
const overflowActions = ref<ContextMenuActionRouteConfig[]>([]);

const hasPromotedActions = computed(() => promotedActions.value.length > 0);
const hasOverflowActions = computed(() => overflowActions.value.length > 0);

const filterVisibleActions = async () => {
  setExtraVariables({
    parentEntityId: props.entityId,
    childEntityId: props.entityId,
  });

  const permissionFetches = props.actions
    .filter((a) => a.can && a.can.length > 0)
    .map((a) => fetchAdvancedPermission(a.can as string[]));
  await Promise.all(permissionFetches);

  const promoted: ContextMenuActionRouteConfig[] = [];
  const overflow: ContextMenuActionRouteConfig[] = [];

  for (const action of props.actions) {
    const hidden = "hidden" in action ? action.hidden : false;
    if (hidden) continue;
    if (isHiddenForMetadata(action)) continue;

    const hasPermission =
      !action.can ||
      action.can.length === 0 ||
      advancedPermissions[
        createPermissionCacheKey({
          permission: action.can[0],
          parentEntityId: props.entityId,
          childEntityId: props.entityId,
        })
      ];

    if (!hasPermission) continue;

    if ("showAsButton" in action && action.showAsButton) {
      promoted.push(action);
    } else {
      overflow.push(action);
    }
  }

  promotedActions.value = promoted;
  overflowActions.value = overflow;
};

onMounted(filterVisibleActions);
watch(
  () => [
    props.actions,
    props.entityId,
    props.actions.map((action) => isHiddenForMetadata(action)),
  ],
  filterVisibleActions,
);
</script>
