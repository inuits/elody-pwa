<template>
  <ContextMenuActionsShell
    ref="shell"
    class="!m-0"
    :has-promoted-actions="
      flat ? flatOptions.length > 0 : primaryOption !== undefined
    "
    :has-overflow-actions="menuOptions.length > 0 || hasSubDropdownOptions"
    :split="!flat"
    @open="clearSubDropdownOptions"
  >
    <template #promoted>
      <!-- Flat (ui_kits/clients selection row): every action its own button,
           disabled with its reason until it applies, destructive last. -->
      <template v-if="flat">
        <BaseButtonNew
          v-for="option in flatOptions"
          :key="option.value"
          :class="{ '!text-danger-ink': isDanger(option) }"
          button-style="secondary"
          button-size="sm"
          :disabled="!option.active"
          :label="t(option.label, [entityTypeLabel])"
          :aria-label="nameWithCount(option)"
          :tooltip-label="tooltipFor(option)"
          :icon="option.icon"
          :force-show-label="true"
          @click.stop="handleEmit(option)"
        />
      </template>
      <BaseButtonNew
        v-else-if="primaryOption"
        button-style="primary"
        button-size="sm"
        :disabled="!primaryOption.active || isMainActionDisabled"
        :label="t(primaryOption.label, [entityTypeLabel])"
        :aria-label="nameWithCount(primaryOption)"
        :tooltip-label="tooltipFor(primaryOption)"
        :icon="primaryOption.icon"
        :force-show-label="true"
        @click.stop="
          (event: MouseEvent) => {
            handleEmit(primaryOption!);
            if (primaryOption!.value === BulkOperationTypes.OpenDropdown)
              shell?.openFrom(event.currentTarget as HTMLElement);
          }
        "
      />
    </template>
    <template #overflow>
      <template v-if="hasSubDropdownOptions">
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
      </template>
      <template v-else>
        <BaseContextMenuItem
          v-for="(option, idx) in menuOptions"
          :key="idx"
          :label="t(option?.label, [entityTypeLabel])"
          :icon="option.icon ? Unicons[option.icon]?.name : undefined"
          :style="toneStyle(option)"
          :tooltip-label="tooltipFor(option)"
          :disable="!option.active"
          @clicked="handleEmit(option)"
        />
      </template>
    </template>
  </ContextMenuActionsShell>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import {
  ActionContextEntitiesSelectionType,
  type DropdownOption,
  Entitytyping,
  BulkOperationTypes,
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import ContextMenuActionsShell from "@/components/ContextMenuActionsShell.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { auth } from "@/main";
import { Unicons } from "@/types";
import {
  dangerLast,
  isDanger,
  toneStyle,
} from "@/components/context-menu-actions/actionTone";
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
    // Every action as its own button instead of a split button.
    flat?: boolean;
  }>(),
  {
    isMainActionDisabled: false,
    flat: false,
    itemsSelected: false,
    selectedItems: () => [],
    options: () => [],
    subDropdownOptions: () => [],
  },
);
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

// One primary, like a row's split button; every other action is in its menu.
const primaryOption = computed<DropdownOption | undefined>(
  () => primaryOptions.value[0],
);

const opensDropdown = (option: DropdownOption) =>
  option.value === BulkOperationTypes.OpenDropdown;
// Flat: actions that open a sub-menu stay behind the labelled "Actions" menu.
const flatOptions = computed<DropdownOption[]>(() =>
  dangerLast(
    optionsWithActiveState.value.filter((option) => !opensDropdown(option)),
  ),
);

const menuOptions = computed<DropdownOption[]>(() =>
  props.flat
    ? optionsWithActiveState.value.filter(opensDropdown)
    : dangerLast([...primaryOptions.value.slice(1), ...secondaryOptions.value]),
);

const shell = ref<InstanceType<typeof ContextMenuActionsShell>>();

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

