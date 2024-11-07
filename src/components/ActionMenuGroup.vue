<template>
  <div class="flex flex-row justify-end items-center !m-0">
    <BaseButtonNew
      v-if="primaryOption"
      class="pr-6"
      :class="{ '-mr-4': filterSecondaryDropdownOptions.length > 0 }"
      button-style="accentNormal"
      button-size="small"
      :disabled="isMainActionDisabled || !primaryOption.active"
      :label="t(primaryOption.label)"
      :tooltip-label="primaryOption.actionContext?.labelForTooltip"
      @click="handleEmit(primaryOption)"
    />
    <BaseButtonNew
      v-if="hasSecondaryOptions"
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
import { computed, ref, watch } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import {
  DropdownOption,
  DamsIcons,
  ContextMenuDirection,
  ActionContextViewModeTypes,
  ActionContextEntitiesSelectionType,
  Entitytyping,
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import useEditMode from "@/composables/useEdit";
import { useAuth } from "session-vue-3-oidc-library";
import {
  usePermissions,
  advancedPermissions,
} from "@/composables/usePermissions";

const { isEdit } = useEditMode();

const emit = defineEmits(["update:modelValue"]);
const { fetchPermissionsForDropdownOptions, setExtraVariables } =
  usePermissions();

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownOption;
    options: DropdownOption[];
    isMainActionDisabled: boolean;
    itemsSelected?: boolean;
    entityType: Entitytyping;
    parentEntityId?: string | undefined;
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

const availableOptions = ref<DropdownOption[]>([]);

const primaryOption = computed(() => {
  let option = availableOptions.value.find(
    (item: DropdownOption) => item.primary
  );
  if (option) {
    option = {
      ...option,
      active: determineActiveState(option),
    };
  }
  return option;
});

const secondaryOptions = computed(() => {
  return (
    availableOptions.value
      .filter((item: DropdownOption) => !item?.primary)
      .map((item: DropdownOption) => ({ ...item, active: true })) || []
  );
});

const filterSecondaryDropdownOptions = computed<DropdownOption[]>(() => {
  return secondaryOptions.value.map((dropdownOption) => {
    dropdownOption.active = determineActiveState(dropdownOption);
    return dropdownOption;
  });
});

const hasSecondaryOptions = computed(() => {
  return filterSecondaryDropdownOptions.value.length > 0;
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};

const determineActiveState = (item: DropdownOption) => {
  if (!item.actionContext) return true;
  let isActive = false;

  const activeViewMode = item.actionContext.activeViewMode;
  const entitiesSelectionType = item.actionContext.entitiesSelectionType;
  const viewMode = isEdit.value
    ? activeViewMode.includes(ActionContextViewModeTypes.EditMode)
    : activeViewMode.includes(ActionContextViewModeTypes.ReadMode);
  const numberOfEntities = props.itemsSelected
    ? entitiesSelectionType === ActionContextEntitiesSelectionType.SomeSelected
    : entitiesSelectionType === ActionContextEntitiesSelectionType.NoneSelected;
  isActive = viewMode && numberOfEntities;

  return isActive;
};

const getAvailableOptions = () => {
  const permittedOptions = props.options.filter((item: DropdownOption) => {
    return (
      !item.can ||
      (item.can && item.can.length > 0 && advancedPermissions[item.can[0]])
    );
  });

  availableOptions.value = permittedOptions.filter((item: DropdownOption) => {
    return (
      !item?.requiresAuth ||
      (item?.requiresAuth && auth.isAuthenticated.value === true) ||
      (item.can && item.can.length > 0 && advancedPermissions[item.can[0]])
    );
  });
};

watch(
  () => props.options,
  async () => {
    setExtraVariables({
      parentEntityId: props.parentEntityId,
      childEntityId: "",
    });
    await fetchPermissionsForDropdownOptions(props.options);
    getAvailableOptions();
  },
  { deep: true, immediate: true }
);
</script>
