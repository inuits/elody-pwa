<template>
  <div class="flex flex-row justify-end items-center">
    <BaseButtonNew
      v-if="primaryOption"
      class="-mr-4 pr-6"
      button-style="accentNormal"
      :disabled="isMainActionDisabled"
      :label="t(primaryOption.label)"
      @click="handleEmit(primaryOption)"
    />
    <BaseButtonNew
      v-if="filterSecondaryDropdownOptions.length > 0"
      :icon="DamsIcons.EllipsisV"
      class="!w-max !border-l-2 border-white"
      @click.stop="(event: MouseEvent) => contextMenuHandler.openContextMenu({x: event.clientX, y: event.clientY})"
    />

    <BaseContextMenu
      :context-menu="contextMenuHandler.getContextMenu()"
      :direction="ContextMenuDirection.Left"
    >
      <BaseContextMenuItem
        v-for="(option, idx) in filterSecondaryDropdownOptions"
        :key="idx"
        @clicked="handleEmit(option)"
        :label="t(option.label)"
      />
    </BaseContextMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import {
  DropdownOption,
  DamsIcons,
  ContextMenuDirection,
  ActionContextViewModeTypes,
  ActionContextEntitiesSelectionType
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import useEditMode from "@/composables/useEdit";

const { isEdit } = useEditMode();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownOption;
    options: DropdownOption[];
    isMainActionDisabled: boolean;
    itemsSelected?: boolean;
  }>(),
  {
    isMainActionDisabled: false,
    itemsSelected: false,
    options: () => [],
  }
);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const { t } = useI18n();

const primaryOption = computed(() => {
  return props.options.find((item: DropdownOption) => item.primary);
});

const secondaryOptions = computed(() => {
  return props.options.filter((item: DropdownOption) => !item?.primary);
});

const filterSecondaryDropdownOptions = computed<DropdownOption[]>(() => {
  return secondaryOptions.value.filter((dropdownOption) => {
    if (!dropdownOption.actionContext) return true;
    const activeViewMode = dropdownOption.actionContext.activeViewMode;
    const entitiesSelectionType =
      dropdownOption.actionContext.entitiesSelectionType;
    const viewMode = isEdit.value
      ? activeViewMode === ActionContextViewModeTypes.EditMode
      : activeViewMode === ActionContextViewModeTypes.ReadMode;
    const numberOfEntities = props.itemsSelected
      ? entitiesSelectionType ===
      ActionContextEntitiesSelectionType.SomeSelected
      : entitiesSelectionType ===
      ActionContextEntitiesSelectionType.NoneSelected;
    return viewMode && numberOfEntities;
  });
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};
</script>
