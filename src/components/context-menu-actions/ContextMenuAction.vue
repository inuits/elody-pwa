<template>
  <div v-for="(element, index) in contextMenuActions" :key="index">
    <link-action
      v-if="element.__typename === 'ContextMenuLinkAction'"
      :label="element.label"
      :icon="element.icon"
      :entityId="entityId"
      :entity-type="entityType"
    />
    <general-action
      v-if="element.__typename === 'ContextMenuGeneralAction'"
      :label="element.label"
      :icon="element.icon"
      :action="element.action"
      :parent-entity-id="parentEntityId"
      :entityId="entityId"
      @click.stop="handleEmit()"
      @toggle-loading="emit('toggleLoading', $event)"
    />
    <elody-action
      v-if="element.__typename === 'ContextMenuElodyAction'"
      :label="element.label"
      :icon="element.icon"
      :action="element.action"
      :entity-type="entityType"
      :entity-id="entityId"
      :relation="relation"
      :bulk-operations-context="bulkOperationsContext"
      :refetch-entities="refetchEntities"
    />
  </div>
</template>

<script lang="ts" setup>
import { type ContextMenuActions } from "@/generated-types/queries";
import GeneralAction from "@/components/context-menu-actions/GeneralAction.vue";
import ElodyAction from "@/components/context-menu-actions/ElodyAction.vue";
import LinkAction from "@/components/context-menu-actions/LinkAction.vue";
import { Entitytyping } from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";

const emit = defineEmits(["toggleLoading"]);

const props = defineProps<{
  contextMenuActions: ContextMenuActions;
  entityId: string;
  entityType: Entitytyping;
  parentEntityId?: string;
  relation?: object;
  bulkOperationsContext: Context;
  refetchEntities: Function;
}>();

const handleEmit = () => {
  emit("toggleLoading");
};
</script>
