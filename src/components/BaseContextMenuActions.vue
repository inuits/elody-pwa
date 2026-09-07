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
import { computed } from "vue";
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

// The graphql layer leaves out every action the user has no permission for, so
// what arrives here only still needs splitting over the two slots.
const availableActions = computed(() => {
  const { __typename, ...restMenuActions } = { ...props.contextMenuActions };

  const promoted: Partial<ContextMenuActions> = {};
  const overflow: Partial<ContextMenuActions> = {};

  for (const key in restMenuActions) {
    const action = restMenuActions[key as keyof typeof restMenuActions];
    if (!action) continue;
    if ("hidden" in action && action.hidden) continue;

    const slot = "showAsButton" in action ? promoted : overflow;
    slot[key as keyof ContextMenuActions] = action as any;
  }

  return { promoted, overflow };
});

const promotedActions = computed(() => availableActions.value.promoted);
const overflowActions = computed(() => availableActions.value.overflow);

const hasAvailableContextMenuActions = computed(
  () => Object.keys(overflowActions.value).length > 0,
);

const hasPromotedActions = computed(
  () => Object.keys(promotedActions.value).length > 0,
);
</script>
