<template>
  <context-menu-actions-shell
    :has-promoted-actions="hasPromotedActions"
    :has-overflow-actions="hasAvailableContextMenuActions"
  >
    <template #promoted>
      <context-menu-action
        :context-menu-actions="promotedActions"
        :parent-entity-id="parentEntityId"
        :entity-id="entityId"
        :entity-type="entityType"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        class="is-promoted-button"
        @toggle-loading="handleEmit"
        :as-button="true"
      />
    </template>
    <template #overflow>
      <context-menu-action
        :context-menu-actions="overflowActions"
        :parent-entity-id="parentEntityId"
        :entity-id="entityId"
        :entity-type="entityType"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        @toggle-loading="handleEmit"
      />
    </template>
  </context-menu-actions-shell>
</template>

<script lang="ts" setup>
import type { Entitytyping } from "@/generated-types/queries";
import { type ContextMenuActions } from "@/generated-types/queries";
import ContextMenuAction from "@/components/context-menu-actions/ContextMenuAction.vue";
import ContextMenuActionsShell from "@/components/ContextMenuActionsShell.vue";
import { ref, computed, onMounted, watch } from "vue";
import {
  usePermissions,
  advancedPermissions,
} from "@/composables/usePermissions";
import type { Context } from "@/composables/useBulkOperations";

const props = withDefaults(
  defineProps<{
    contextMenuActions?: ContextMenuActions;
    entityId: string;
    entityType?: Entitytyping;
    parentEntityId?: string;
    relation?: object | string;
    bulkOperationsContext: Context | undefined;
    refetchEntities?: () => Promise<void>;
  }>(),
  {
    contextMenuActions: undefined,
    refetchEntities: undefined,
  },
);

const emit = defineEmits(["toggleLoading"]);

const handleEmit = () => {
  emit("toggleLoading");
};

const {
  fetchPermissionsOfContextMenu,
  setExtraVariables,
  createPermissionCacheKey,
} = usePermissions();

const promotedActions = ref<Partial<ContextMenuActions>>({});
const overflowActions = ref<Partial<ContextMenuActions>>({});

const getAvailableContextMenuActions = () => {
  const { __typename, ...restMenuActions } = { ...props.contextMenuActions };

  const promoted: Partial<ContextMenuActions> = {};
  const overflow: Partial<ContextMenuActions> = {};

  for (const key in restMenuActions) {
    const action = restMenuActions[key as keyof typeof restMenuActions];
    if (!action) continue;
    const permission = "can" in action ? action.can : undefined;
    const hidden = "hidden" in action ? action.hidden : false;

    const hasPermission =
      !permission ||
      permission.length === 0 ||
      advancedPermissions[
        createPermissionCacheKey({
          permission: permission[0] as string,
          parentEntityId: props.parentEntityId,
          childEntityId: props.entityId,
        })
      ];

    if (hasPermission && !hidden) {
      if ("showAsButton" in action) {
        promoted[key as keyof ContextMenuActions] = action as any;
      } else {
        overflow[key as keyof ContextMenuActions] = action as any;
      }
    }
  }

  promotedActions.value = promoted;
  overflowActions.value = overflow;
};

const hasAvailableContextMenuActions = computed(() => {
  return Object.keys(overflowActions.value).length > 0;
});

const hasPromotedActions = computed(() => {
  return Object.keys(promotedActions.value).length > 0;
});

onMounted(async () => {
  await initializeMenuActions();
});

watch(
  () => props.contextMenuActions,
  async () => {
    await initializeMenuActions();
  },
);

const initializeMenuActions = async () => {
  if (!props.contextMenuActions) return;
  setExtraVariables({
    parentEntityId: props.parentEntityId,
    childEntityId: props.entityId,
  });
  await fetchPermissionsOfContextMenu(props.contextMenuActions);
  getAvailableContextMenuActions();
};
</script>
