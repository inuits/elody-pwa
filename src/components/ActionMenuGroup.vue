<template>
  <div class="flex flex-row flex-wrap justify-end items-center gap-2 !m-0">
    <BaseButtonNew
      v-for="option in visibleOptions"
      :key="option.value"
      class="action-row-button"
      :button-style="primaryOptions.includes(option) ? 'primary' : 'secondary'"
      button-size="sm"
      :disabled="
        !option.active ||
        (isMainActionDisabled && primaryOptions.includes(option))
      "
      :label="t(option.label, [entityTypeLabel])"
      :aria-label="nameWithCount(option)"
      :tooltip-label="tooltipFor(option)"
      :icon="option.icon"
      :force-show-label="true"
      @click.stop="
        (event: MouseEvent) => {
          handleEmit(option);
          if (option.value === BulkOperationTypes.OpenDropdown)
            contextMenuHandler.openContextMenu(
              { x: 0, y: 0 },
              event.currentTarget as HTMLElement,
            );
        }
      "
    />
    <!-- Never a bare ⋮: the overflow names itself. -->
    <BaseButtonNew
      v-if="overflowOptions.length > 0"
      class="action-row-button"
      button-style="secondary"
      button-size="sm"
      :label="t('bulk-operations.more-actions')"
      :force-show-label="true"
      aria-haspopup="menu"
      :aria-expanded="isMenuOpen"
      @click.stop="
        (event: MouseEvent) => {
          clearSubDropdownOptions();
          contextMenuHandler.openContextMenu(
            { x: 0, y: 0 },
            event.currentTarget as HTMLElement,
          );
        }
      "
    >
      <unicon
        :name="isMenuOpen ? Unicons.AngleUp.name : Unicons.AngleDown.name"
        height="14"
      />
    </BaseButtonNew>

    <div v-if="hasSubDropdownOptions" class="!m-0">
      <BaseContextMenu
        :context-menu="contextMenuHandler.getContextMenu()"
        :direction="ContextMenuDirection.Left"
      >
        <BaseContextMenuItem
          v-for="(option, idx) in subDropdownOptions"
          :key="idx"
          :label="
            t(option?.label, [
              t(`entity-translations.${props.entityType?.toLowerCase()}`, 2),
            ])
          "
          :tooltip-label="tooltipFor(option)"
          :disable="!option.active"
          @clicked="handleEmit(option)"
        />
      </BaseContextMenu>
    </div>
    <div v-else>
      <BaseContextMenu
        :context-menu="contextMenuHandler.getContextMenu()"
        :direction="ContextMenuDirection.Left"
      >
        <BaseContextMenuItem
          v-for="(option, idx) in overflowOptions"
          :key="idx"
          :label="t(option?.label, [entityTypeLabel])"
          :tooltip-label="tooltipFor(option)"
          :disable="!option.active"
          @clicked="handleEmit(option)"
        />
      </BaseContextMenu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import {
  ContextMenuDirection,
  ActionContextEntitiesSelectionType,
  type DropdownOption,
  Entitytyping,
  BulkOperationTypes,
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { auth } from "@/main";
import { Unicons } from "@/types";
import { determineActiveState } from "@/composables/useBulkOperationsActionsBar";
import { determineSelectionConstraintViolation } from "@/composables/useSelectionConstraints";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownOption;
    options: DropdownOption[];
    isMainActionDisabled?: boolean;
    itemsSelected?: boolean;
    selectedItems?: InBulkProcessableItem[];
    entityType: Entitytyping;
    parentEntityId?: string | undefined;
    subDropdownOptions?: DropdownOption[];
    clearSubDropdownOptions: () => void;
  }>(),
  {
    isMainActionDisabled: false,
    itemsSelected: false,
    selectedItems: () => [],
    options: () => [],
    subDropdownOptions: () => [],
  },
);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const { t } = useI18n();

const availableOptions = ref<DropdownOption[]>([]);

const tooltipFor = (option: DropdownOption): string | undefined => {
  const violation = determineSelectionConstraintViolation(
    option?.actionContext,
    props.selectedItems,
  );
  if (violation)
    return t(`tooltip.bulkOperations.${violation}`, {
      minimum: option?.actionContext?.minSelectedItems ?? 0,
      maximum: option?.actionContext?.maxSelectedItems ?? 0,
    });
  return option?.actionContext?.labelForTooltip ?? undefined;
};

const entityTypeLabel = computed(() =>
  t(`entity-translations.${props.entityType?.toLowerCase()}`, 2),
);
const optionsWithActiveState = computed<DropdownOption[]>(() =>
  availableOptions.value.map((option) => ({
    ...option,
    active: determineActiveState(
      option,
      props.parentEntityId,
      props.itemsSelected,
      props.selectedItems,
    ),
  })),
);

const primaryOptions = computed<DropdownOption[]>(() => {
  const primaries = optionsWithActiveState.value.filter(
    (option) => option.primary,
  );
  if (primaries.some((option) => option.active)) return primaries;
  const fallback = optionsWithActiveState.value.find(
    (option) => option.primaryFallback && option.active,
  );
  return fallback ? [fallback] : primaries;
});

const secondaryOptions = computed<DropdownOption[]>(() =>
  optionsWithActiveState.value.filter(
    (option) => !primaryOptions.value.includes(option),
  ),
);

// The handoff caps the visible row at about five actions.
const MAX_VISIBLE_ACTIONS = 5;

const visibleOptions = computed<DropdownOption[]>(() =>
  [...primaryOptions.value, ...secondaryOptions.value].slice(
    0,
    MAX_VISIBLE_ACTIONS,
  ),
);

const overflowOptions = computed<DropdownOption[]>(() =>
  secondaryOptions.value.filter(
    (option) => !visibleOptions.value.includes(option),
  ),
);

const isMenuOpen = computed<boolean>(
  () => contextMenuHandler.value.getContextMenu()?.isVisible ?? false,
);

// Screen readers hear what a selection action acts on: "Delete (2 selected)".
const nameWithCount = (option: DropdownOption): string | undefined =>
  props.itemsSelected &&
  option.actionContext?.entitiesSelectionType ===
    ActionContextEntitiesSelectionType.SomeSelected
    ? t("bulk-operations.action-for-selection", {
        action: t(option.label, [entityTypeLabel.value]),
        count: props.selectedItems.length,
      })
    : undefined;

const hasSubDropdownOptions = computed(() => {
  return props.subDropdownOptions.length > 0;
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};

watch(
  () => props.options,
  () => {
    availableOptions.value = props.options.filter(
      (item: DropdownOption) =>
        !item?.requiresAuth || auth.isAuthenticated.value === true,
    );
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
/* BaseButtonNew fills its parent by default; row buttons size to their label. */
.action-row-button {
  width: auto;
}
</style>
