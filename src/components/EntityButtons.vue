<template>
  <div class="flex items-center" @click.stop.prevent>
    <template v-for="[key, value] in configuredButtons" :key="key">
      <BaseContextMenuActions
        v-if="key === 'contextMenu'"
        :context-menu-actions="value as ContextMenuActions"
        :parent-entity-id="parentEntityId"
        :entity-id="entityId"
        :entity-type="entityType"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        @toggle-loading="emit('toggleLoading')"
      />
      <BaseTooltip v-else position="top-right" :tooltip-offset="8">
        <template #activator="{ on }">
          <button
            v-on="on"
            type="button"
            class="flex mx-1 cursor-pointer"
            :aria-label="t((value as ActionButton).label)"
            @click="runButton(value as ActionButton)"
          >
            <unicon
              :name="Unicons[(value as ActionButton).icon]?.name"
              class="h-5.5 w-5.5 text-text-body"
            />
          </button>
        </template>
        <template #default>
          <span class="text-sm text-text-placeholder">
            {{ t((value as ActionButton).label) }}
          </span>
        </template>
      </BaseTooltip>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import type {
  ActionButton,
  Buttons,
  ContextMenuActions,
  Entitytyping,
} from "@/generated-types/queries";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";
import {
  useActionButton,
  isActionButtonHidden,
} from "@/composables/useActionButton";
import type { Context } from "@/composables/useBulkOperations";

const props = withDefaults(
  defineProps<{
    buttons?: Buttons;
    entityId: string;
    entityType?: Entitytyping;
    parentEntityId?: string;
    relation?: object | string;
    bulkOperationsContext: Context | undefined;
    refetchEntities?: () => Promise<void>;
    intialValues?: object;
    relationValues?: object;
  }>(),
  {
    buttons: undefined,
    refetchEntities: undefined,
    intialValues: () => ({}),
    relationValues: () => ({}),
  },
);

const emit = defineEmits(["toggleLoading"]);

const { t } = useI18n();
const { runActionButton } = useActionButton();
const refetchParentEntity = inject<() => unknown>(
  "RefetchParentEntity",
  () => undefined,
);

const rowValues = computed(() => ({
  intialValues: props.intialValues,
  relationValues: props.relationValues,
}));

const configuredButtons = computed(() =>
  Object.entries(props.buttons ?? {}).filter(
    (entry): entry is [string, ActionButton | ContextMenuActions] => {
      const [key, value] = entry;
      if (key === "__typename" || !value) return false;
      if (key === "contextMenu") return true;
      return !isActionButtonHidden(
        value as ActionButton,
        props.entityId,
        rowValues.value,
      );
    },
  ),
);

const runButton = (button: ActionButton) =>
  runActionButton(button, props.entityId, rowValues.value, refetchParentEntity);
</script>
