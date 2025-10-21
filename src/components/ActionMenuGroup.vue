<template>
  <div
    class="flex flex-row justify-end items-center !m-0"
    :class="[{ 'w-fit': primaryOption }]"
  >
    <BaseButtonNew
      v-if="primaryOption"
      class="pr-6"
      :class="{ '-mr-4': filterSecondaryDropdownOptions.length > 0 }"
      button-style="accentNormal"
      button-size="small"
      :disabled="isMainActionDisabled || !primaryOption.active"
      :label="t(primaryOption.label, [entityTypeLabel])"
      :tooltip-label="primaryOption.actionContext?.labelForTooltip"
      :icon="primaryOption.icon"
      @click.stop=" (event: MouseEvent) => {
        handleEmit(primaryOption);
        contextMenuHandler.openContextMenu({
              x: event.clientX,
              y: event.clientY,
        });
      }"
    />
    <BaseButtonNew
      v-if="hasSecondaryOptions"
      button-size="small"
      :icon="DamsIcons.EllipsisV"
      class="!w-max !p-2"
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

    <div v-if="subDropdownOptions?.length > 0" class="!m-0">
      <BaseContextMenu
        :context-menu="contextMenuHandler.getContextMenu()"
        :direction="ContextMenuDirection.Left"
      >
        <BaseContextMenuItem
          v-for="(option, idx) in subDropdownOptions"
          :key="idx"
          :label="
            t(option?.label, [
              t(`entity-translations.plural.${props.entityType}`),
            ])
          "
          :tooltip-label="option?.actionContext?.labelForTooltip"
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
          v-for="(option, idx) in filterSecondaryDropdownOptions"
          :key="idx"
          :label="t(option?.label, [entityTypeLabel])"
          :tooltip-label="option?.actionContext?.labelForTooltip"
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
} from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { auth } from "@/main";
import {
  usePermissions,
  advancedPermissions,
} from "@/composables/usePermissions";
import { determineActiveState } from "@/composables/useBulkOperationsActionsBar";

const emit = defineEmits(["update:modelValue"]);
const {
  fetchPermissionsForDropdownOptions,
  setExtraVariables,
  createPermissionCacheKey,
} = usePermissions();

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownOption;
    options: DropdownOption[];
    isMainActionDisabled?: boolean;
    itemsSelected?: boolean;
    entityType: Entitytyping;
    parentEntityId?: string | undefined;
    subDropdownOptions?: DropdownOption[];
    clearSubDropdownOptions: Function;
  }>(),
  {
    isMainActionDisabled: false,
    itemsSelected: false,
    options: () => [],
    subDropdownOptions: () => [],
  },
);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const { t } = useI18n();

const availableOptions = ref<DropdownOption[]>([]);

const entityTypeLabel = computed(() =>
  t(`entity-translations.plural.${props.entityType}`),
);
const primaryOption = computed(() => {
  let option = availableOptions.value.find(
    (item: DropdownOption) => item.primary,
  );
  if (option) {
    option = {
      ...option,
      active: determineActiveState(
        option,
        props.parentEntityId,
        props.itemsSelected,
      ),
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
    dropdownOption.active = determineActiveState(
      dropdownOption,
      props.parentEntityId,
      props.itemsSelected,
    );
    return dropdownOption;
  });
});

const hasSecondaryOptions = computed(() => {
  return filterSecondaryDropdownOptions.value.length > 0;
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};

const getAvailableOptions = () => {
  const permittedOptions = props.options.filter((item: DropdownOption) => {
    return (
      !item.can ||
      (item.can &&
        item.can.length > 0 &&
        advancedPermissions[
          createPermissionCacheKey({
            permission: item.can[0],
            parentEntityId: props.parentEntityId,
          })
        ])
    );
  });

  availableOptions.value = permittedOptions.filter((item: DropdownOption) => {
    return (
      !item?.requiresAuth ||
      (item?.requiresAuth && auth.isAuthenticated.value === true) ||
      (item.can &&
        item.can.length > 0 &&
        advancedPermissions[
          createPermissionCacheKey({
            permission: item.can[0],
            parentEntityId: props.parentEntityId,
          })
        ])
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
  { deep: true, immediate: true },
);
</script>
