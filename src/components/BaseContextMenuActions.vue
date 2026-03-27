<template>
  <Teleport to="#header-actions" :disabled="!showInHeader">
    <div class="flex items-center justify-center pl-2 gap-2">
      <div v-if="hasPromotedActions" class="flex items-center gap-1 pr-2" @click.stop>
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
      </div>

      <div v-if="hasAvailableContextMenuActions">
        <div @click.stop.prevent="openContextMenu" class="cursor-pointer">
          <unicon :name="Unicons.EllipsisVThinline.name" />
        </div>

        <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
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
        </base-context-menu>
      </div>
    </div>
  </Teleport>
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

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu({
    x: event?.clientX,
    y: event?.clientY,
  });
};

const {
  fetchPermissionsOfContextMenu,
  setExtraVariables,
  createPermissionCacheKey,
} = usePermissions();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const showInHeader = computed(() => {
  return props.contextMenuActions?.displaySettings?.showInHeader || false;
});

const promotedActions = ref<Partial<ContextMenuActions>>({});
const overflowActions = ref<Partial<ContextMenuActions>>({});

const getAvailableContextMenuActions = () => {
  const { __typename, ...menuActions } = { ...props.contextMenuActions };
  const { displaySettings, ...restMenuActions } = menuActions;

  const promoted: Partial<ContextMenuActions> = {};
  const overflow: Partial<ContextMenuActions> = {};

  for (const key in restMenuActions) {
    const action = menuActions[key as keyof typeof menuActions];
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
