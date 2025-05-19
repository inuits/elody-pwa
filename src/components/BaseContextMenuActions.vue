<template>
  <div
    v-if="hasAvailableContextMenuActions"
    @click.stop.prevent="openContextMenu"
  >
    <unicon
      :name="Unicons.EllipsisVThinline.name"
    />
    <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
      <context-menu-action
        :context-menu-actions="availableContextMenuActions"
        :parent-entity-id="parentEntityId"
        :entity-id="entityId"
        :entity-type="entityType"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        @toggle-loading="handleEmit"
      />
    </base-context-menu>
  </div>
</template>

<script lang="ts" setup>
import type { Entitytyping } from "@/generated-types/queries";
import { type ContextMenuActions } from "@/generated-types/queries";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import ContextMenuAction from "@/components/context-menu-actions/ContextMenuAction.vue";
import { ref, computed, onMounted, watch } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { Unicons } from "@/types";
import {
  usePermissions,
  advancedPermissions,
} from "@/composables/usePermissions";
import type { Context } from "@/composables/useBulkOperations";

const props = withDefaults(
  defineProps<{
    contextMenuActions?: ContextMenuActions;
    entityId: string;
    entityType: Entitytyping;
    parentEntityId?: string;
    relation?: object | string;
    bulkOperationsContext: Context;
    refetchEntities?: Function;
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

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu({
    x: event?.clientX,
    y: event?.clientY,
  });
};

const { fetchPermissionsOfContextMenu, setExtraVariables } = usePermissions();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const availableContextMenuActions = ref<ContextMenuActions | undefined>(
  undefined,
);

const hasAvailableContextMenuActions = computed(() => {
  if (!availableContextMenuActions.value) return false;
  return Object.keys(availableContextMenuActions.value).length > 0;
});

const getAvailableContextMenuActions = () => {
  const { __typename, ...menuActions } = { ...props.contextMenuActions };
  const availableOptions: Partial<ContextMenuActions> = { ...menuActions };

  for (const key in availableOptions) {
    const action = availableOptions[key as keyof typeof menuActions];
    const permission = action?.can;

    if (
      permission &&
      permission.length > 0 &&
      !advancedPermissions[permission[0] as string]
    ) {
      delete availableOptions[key as keyof typeof menuActions];
    }
  }

  availableContextMenuActions.value = availableOptions;
};

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
