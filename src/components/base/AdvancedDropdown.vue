<template>
  <div
    data-cy="base-dropdown-new"
    :class="[
      labelPosition === 'inline' ? 'flex items-center' : undefined,
      'vue-advanced-select',
    ]"
  >
    <VueSelect
      class="text-text-body bg-neutral-white border-none rounded-lg"
      v-model="selectedItem"
      :options="filterDropdownOptions"
      :placeholder="label"
      :is-disabled="disable"
      :is-multi="multiple"
      :is-clearable="clearable"
      :should-autofocus-option="false"
      @option-selected="selectItem"
    >
      <template #menu-header v-if="label">
        <div class="text-center my-1">
          <h3>{{ label }}</h3>
        </div>
      </template>
      <template #option="{ option }">
        <div v-if="option.value !== selectedItem" class="mr-2">
          <unicon
            v-if="option.icon && Unicons[option.icon]?.name"
            :name="Unicons[option.icon].name"
            height="24"
            width="24"
          />
        </div>
        <div v-else class="mr-2">
          <unicon :name="Unicons.Check.name" height="24" width="24" />
        </div>
        <div class="text-text-body">
          {{ t(option.label) }}
        </div>
      </template>
      <template #value="{ option }">
        <div class="text-text-body flex items-center">
          <unicon
            v-if="addIconToValue && option.icon && Unicons[option.icon]?.name"
            class="mx-1"
            :name="Unicons[option.icon].name"
            height="18"
            width="18"
          />
          <p class="text-center">
            {{ addLabelToValue ? label : "" }}{{ addLabelToValue ? ":" : "" }}
            {{ t(option.label) }}
          </p>
        </div>
      </template>
    </VueSelect>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, inject } from "vue";
import {
  ActionContextEntitiesSelectionType,
  ActionContextViewModeTypes,
  type DropdownOption,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { useRoute } from "vue-router";
import VueSelect from "vue3-select-component";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption | number | string | string[] | undefined;
    options: DropdownOption[];
    selectFirstOptionByDefault?: boolean;
    labelPosition?: "above" | "inline";
    label?: string;
    disable?: boolean;
    itemsSelected?: boolean;
    multiple?: boolean;
    clearable?: boolean;
    addLabelToValue?: boolean;
    addIconToValue?: boolean;
  }>(),
  {
    selectFirstOptionByDefault: false,
    labelPosition: "above",
    disable: false,
    itemsSelected: false,
    multiple: false,
    clearable: true,
    addLabelToValue: false,
    addIconToValue: false,
  },
);

const emit = defineEmits<{
  (
    event: "update:modelValue",
    modelValue: DropdownOption | number | string | string[] | undefined,
  ): void;
}>();

const route = useRoute();
const { t } = useI18n();
const entityFormData: any = inject("entityFormData");
const entityId = computed<string>(() => entityFormData?.id || route.params.id);
const { isEdit } = useEditMode(entityId.value);
const selectedItem = ref<any | undefined>(undefined);

const selectItem = () => {
  emit("update:modelValue", selectedItem.value);
};

const filterDropdownOptions = computed<DropdownOption[]>(() => {
  return props.options.filter((dropdownOption: DropdownOption) => {
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

watch(
  () => props.options,
  () => {
    if (props.options.length > 0)
      if (
        props.selectFirstOptionByDefault ||
        (!props.clearable && !selectedItem.value && !props.modelValue)
      ) {
        selectedItem.value = props.options[0].value;
        emit("update:modelValue", selectedItem.value);
      }
  },
  { immediate: true },
);
watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) return;
    if (typeof props.modelValue === "string") {
      selectedItem.value = props.options.find(
        (option: DropdownOption) => option.value === props.modelValue,
      ).value;
      return;
    }
    selectedItem.value = props.modelValue;
  },
  { immediate: true },
);
</script>

<style>
:deep(.vue-select) {
  --vs-border-radius: 10px;
}
div.menu-option.selected {
  background-color: var(--color-accent-light) !important;
}
div.menu-option:hover {
  background-color: color-mix(
    in srgb,
    var(--color-accent-light) 30%,
    transparent
  ) !important;
}

.vue-advanced-select .search-input {
  &:focus {
    outline: none !important;
    box-shadow: none;
  }
}
</style>
