<template>
  <div
    data-cy="base-dropdown-new"
    :class="[labelPosition === 'inline' ? 'flex items-center' : undefined]"
  >
    <p :class="['pr-2']" v-if="label">{{ t(label) }}</p>
    <select
      :multiple="multiple"
      :disabled="disable"
      :class="[
        'cursor-pointer',
        dropdownStyles[dropdownStyle].style,
        'max-w-full',
        { 'opacity-50': disable },
      ]"
      v-model="selectedItemLabel"
      @change="selectItem"
    >
      <option
        v-for="option in filterDropdownOptions"
        :key="option.value"
        :value="option.label"
        :class="[dropdownStyles[dropdownStyle].hoverStyle]"
      >
        {{ t(option.label) }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import {
  ActionContextEntitiesSelectionType,
  ActionContextViewModeTypes,
  DamsIcons,
  type DropdownOption,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import useEditMode from "@/composables/useEdit";

type Dropdown = {
  style: string;
  hoverStyle: string;
};

const defaultDropdown: Dropdown = {
  style: "text-text-body bg-neutral-white border-none rounded-lg",
  hoverStyle:
    "hover:text-accent-accent hover:bg-neutral-lightest hover:border-none",
};
const defaultFullWidthDropdown: Dropdown = {
  style: "text-text-body bg-neutral-white border-none rounded-lg w-full",
  hoverStyle:
    "hover:text-accent-accent hover:bg-neutral-lightest hover:border-none",
};
const defaultWithBorderDropdown: Dropdown = {
  style:
    "text-text-body bg-neutral-white border-[rgba(0,58,82,0.6)] rounded-lg w-full",
  hoverStyle:
    "hover:text-accent-accent hover:bg-neutral-lightest hover:border-[rgba(0,58,82,0.6)]",
};
const accentAccentDropdown: Dropdown = {
  style: "text-neutral-white bg-accent-accent border-none rounded-lg",
  hoverStyle: defaultDropdown.hoverStyle,
};
const neutralLightDropdown: Dropdown = {
  style: "text-text-body bg-neutral-light border-none rounded-lg w-full",
  hoverStyle:
    "hover:text-[rgba(0,58,82,0.8)] hover:bg-neutral-lightest hover:border-none",
};

type DropdownStyle =
  | "default"
  | "defaultFullWidth"
  | "defaultWithBorder"
  | "accentAccent"
  | "neutralLight";

const dropdownStyles: Record<DropdownStyle, Dropdown> = {
  default: defaultDropdown,
  defaultFullWidth: defaultFullWidthDropdown,
  defaultWithBorder: defaultWithBorderDropdown,
  accentAccent: accentAccentDropdown,
  neutralLight: neutralLightDropdown,
};

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption | string | undefined;
    options: DropdownOption[];
    dropdownStyle: DropdownStyle;
    defaultOption?: DropdownOption;
    selectFirstOptionByDefault?: boolean;
    labelPosition?: "above" | "inline";
    labelAlignment?: "left" | "right";
    label?: string;
    disable?: boolean;
    itemsSelected?: boolean;
    multiple?: boolean;
  }>(),
  {
    selectFirstOptionByDefault: false,
    labelPosition: "above",
    labelAlignment: "left",
    disable: false,
    itemsSelected: false,
    multiple: false,
  },
);

const emit = defineEmits<{
  (
    event: "update:modelValue",
    modelValue: DropdownOption | DropdownOption[],
  ): void;
}>();

const { t } = useI18n();
const { isEdit } = useEditMode();
const defaultOption: DropdownOption = {
  icon: DamsIcons.AngleDown,
  label: "dropdown.select-option",
  value: "",
};
const allOptions = computed(() => [defaultOption, ...props.options]);
const selectedItem = ref<DropdownOption>(props.defaultOption || defaultOption);
const selectedItemLabel = computed(() => {
  if (Array.isArray(selectedItem.value)) return selectedItem.value[0]?.label;
  return selectedItem.value?.label;
});

const selectDefaultItem = () => {
  selectedItem.value = defaultOption;
};
defineExpose({
  selectDefaultItem,
});

const selectItem = (event: Event) => {
  let newlySelectedOption: DropdownOption | DropdownOption[];
  if (props.multiple) {
    newlySelectedOption = [];
    for (const item of event.target.options) {
      if (item.selected)
        newlySelectedOption.push(
          props.options.find(
            (option: DropdownOption) => option.label === item?.value,
          ),
        );
    }
  } else
    newlySelectedOption = props.options.find(
      (option: DropdownOption) => option.label === event.target?.value,
    );
  if (
    !newlySelectedOption ||
    newlySelectedOption === selectedItem.value ||
    newlySelectedOption === defaultOption
  )
    return;
  selectedItem.value = newlySelectedOption;
  emit("update:modelValue", newlySelectedOption);
};

const filterDropdownOptions = computed<DropdownOption[]>(() => {
  return allOptions.value.filter((dropdownOption) => {
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
      if (props.selectFirstOptionByDefault) {
        selectedItem.value = props.options[0];
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
      );
      return;
    }
    selectedItem.value = props.modelValue;
  },
  { immediate: true, deep: true },
);
</script>
