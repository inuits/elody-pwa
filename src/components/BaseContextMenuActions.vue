<template>
  <context-menu-actions-shell
    :has-promoted-actions="hasPromotedActions"
    :has-overflow-actions="hasAvailableContextMenuActions"
    :context-label="contextLabel"
    :split="Object.keys(promotedActions).length === 1"
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
import { dangerLast } from "@/components/context-menu-actions/actionTone";
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
    contextLabel?: string;
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

const availableActions = computed(() => {
  const restMenuActions = { ...props.contextMenuActions };
  delete restMenuActions.__typename;

  type Entry = [string, { hidden?: boolean; showAsButton?: boolean | null }];
  const visible = (Object.entries(restMenuActions) as Entry[]).filter(
    ([, action]) => action && typeof action === "object" && !action.hidden,
  );
  const isPromoted = ([, action]: Entry) => Boolean(action.showAsButton);

  // One primary per entity: further promoted actions lead the menu.
  const [primary] = visible.filter(isPromoted);
  const menu = dangerLast(
    [
      ...visible.filter((entry) => isPromoted(entry) && entry !== primary),
      ...visible.filter((entry) => !isPromoted(entry)),
    ],
    ([, action]) => action,
  );

  return {
    promoted: Object.fromEntries(primary ? [primary] : []) as Partial<ContextMenuActions>,
    overflow: Object.fromEntries(menu) as Partial<ContextMenuActions>,
  };
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
