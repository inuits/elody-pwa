<template>
  <div
    class="flex flex-row justify-end items-center !m-0"
    :class="[{ 'w-fit': primaryOptions }]"
  >
    <div class="flex flex-col">
      <BaseButtonNew
        v-for="primaryOption in primaryOptions"
        :key="primaryOption"
        class="pl-4 pr-6 my-1"
        :class="{ '-mr-4': secondaryOptions.length > 0 }"
        button-style="commit"
        button-size="sm"
        :disabled="isMainActionDisabled || !primaryOption.active"
        :label="t(primaryOption.label, [entityTypeLabel])"
        :tooltip-label="tooltipFor(primaryOption)"
        :icon="primaryOption.icon"
        :force-show-label="primaryOptions.length > 1"
        @click.stop="
          (event: MouseEvent) => {
            handleEmit(primaryOption);
            if (primaryOption.value === BulkOperationTypes.OpenDropdown)
              contextMenuHandler.openContextMenu({
                x: event.clientX,
                y: event.clientY,
              });
          }
        "
      />
    </div>
    <BaseButtonNew
      v-if="hasSecondaryOptions"
      button-size="sm"
      :icon="DamsIcons.EllipsisV"
      class="!w-max !p-2 ml-2"
      @click.stop="
        (event: MouseEvent) => {
          clearSubDropdownOptions();
          contextMenuHandler.openContextMenu({
            x: event.clientX,
            y: event.clientY,
          });
        }
      "
    />

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
          v-for="(option, idx) in secondaryOptions"
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
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  BulkOperationTypes,
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { auth } from "@/main";
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

const hasSecondaryOptions = computed(() => {
  return secondaryOptions.value.length > 0;
});

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
