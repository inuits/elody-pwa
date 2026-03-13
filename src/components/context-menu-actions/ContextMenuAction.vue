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
      :parent-entity-id="parentEntityId"
      :relation="relation"
      :bulk-operations-context="bulkOperationsContext"
      :refetch-entities="refetchEntities"
      :form-query="element.formQuery"
      :form-flow="element.formFlow"
      :form-title="element.formTitle"
      :as-button="asButton"
    />
    <custom-action
      v-if="element.__typename === 'ContextMenuCustomAction'"
      :label="element.label"
      :icon="element.icon"
      :action="element.action"
      :entity-id="parentEntityId"
      :endpoint-url="element.endpointUrl"
      :endpoint-method="element.endpointMethod"
    />
    <query-action
      v-if="element.__typename === 'ContextMenuQueryAction'"
      :label="element.label"
      :icon="element.icon"
      :query="element.query"
      :refresh-after-action="element.refreshAfterAction"
      :entity-id="parentEntityId"
    />
  </div>
</template>

<script lang="ts" setup>
import { type ContextMenuActions } from "@/generated-types/queries";
import GeneralAction from "@/components/context-menu-actions/GeneralAction.vue";
import ElodyAction from "@/components/context-menu-actions/ElodyAction.vue";
import LinkAction from "@/components/context-menu-actions/LinkAction.vue";
import CustomAction from "@/components/context-menu-actions/CustomAction.vue";
import QueryAction from "@/components/context-menu-actions/QueryAction.vue";
import { Entitytyping } from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";

const emit = defineEmits(["toggleLoading"]);

defineProps<{
  contextMenuActions: ContextMenuActions;
  entityId: string;
  entityType: Entitytyping;
  parentEntityId?: string;
  relation?: object;
  bulkOperationsContext: Context | undefined;
  refetchEntities: () => any;
  asButton?: boolean;
}>();

const handleEmit = () => {
  emit("toggleLoading");
};
</script>
