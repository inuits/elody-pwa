<template>
  <div class="flex flex-row justify-end items-center !m-0">
    <BaseButtonNew
      v-if="primaryOption"
      class="pr-6"
      :class="{ '-mr-4': filterSecondaryDropdownOptions.length > 0 }"
      button-style="accentNormal"
      button-size="small"
      :disabled="isMainActionDisabled"
      :label="t(primaryOption.label)"
      @click="handleEmit(primaryOption)"
    />
    <BaseButtonNew
      v-if="filterSecondaryDropdownOptions.length > 0"
      button-size="small"
      :icon="DamsIcons.EllipsisV"
      class="!w-max !p-2"
      @click.stop="(event: MouseEvent) => contextMenuHandler.openContextMenu({x: event.clientX, y: event.clientY})"
    />

    <BaseContextMenu
      :context-menu="contextMenuHandler.getContextMenu()"
      :direction="ContextMenuDirection.Left"
    >
      <BaseContextMenuItem
        v-for="(option, idx) in filterSecondaryDropdownOptions"
        :key="idx"
        :label="t(option?.label, [entityType])"
        :tooltip-label="option?.actionContext?.labelForTooltip"
        :disable="!option.active"
        @clicked="handleEmit(option)"
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
  ActionContextEntitiesSelectionType,
  Entitytyping
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import useEditMode from "@/composables/useEdit";
import { useAuth } from "session-vue-3-oidc-library";

const { isEdit } = useEditMode();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownOption;
    options: DropdownOption[];
    isMainActionDisabled: boolean;
    itemsSelected?: boolean;
    entityType: Entitytyping;
  }>(),
  {
    isMainActionDisabled: false,
    itemsSelected: false,
    options: () => [],
  }
);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const { t } = useI18n();

const auth = useAuth();

const availableOptions = computed(() => {
  return props.options.filter((item: DropdownOption) => {
    return (
      !item?.requiresAuth ||
      (item?.requiresAuth && auth.isAuthenticated.value === true)
    );
  });
});

const primaryOption = computed(() => {
  return availableOptions.value.find((item: DropdownOption) => item.primary);
});

const secondaryOptions = computed(() => {
  return availableOptions.value
    .filter((item: DropdownOption) => !item?.primary)
    .map((item: DropdownOption) => ({ ...item, active: true }));
});

const filterSecondaryDropdownOptions = computed<DropdownOption[]>(() => {
  return secondaryOptions.value.map((dropdownOption) => {
    if (!dropdownOption.actionContext) dropdownOption.active = true;
    else {
      const activeViewMode = dropdownOption.actionContext.activeViewMode;
      const entitiesSelectionType =
        dropdownOption.actionContext.entitiesSelectionType;
      const viewMode = isEdit.value
        ? activeViewMode.includes(ActionContextViewModeTypes.EditMode)
        : activeViewMode.includes(ActionContextViewModeTypes.ReadMode);
      const numberOfEntities = props.itemsSelected
        ? entitiesSelectionType ===
          ActionContextEntitiesSelectionType.SomeSelected
        : entitiesSelectionType ===
          ActionContextEntitiesSelectionType.NoneSelected;
      dropdownOption.active = viewMode && numberOfEntities;
    }
    return dropdownOption;
  });
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};
</script>
