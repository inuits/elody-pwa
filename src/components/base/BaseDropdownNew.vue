<template>
  <div :class="[labelPosition === 'inline' ? 'flex items-center' : undefined]">
    <p :class="['pr-2']" v-if="label">{{ t(label) }}</p>
    <select
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
        v-for="option in [defaultOption, ...options]"
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
import { computed, onMounted, ref, watch } from "vue";
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

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
  style: "text-text-body bg-neutral-light border-none rounded-lg",
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
    selectFirstOptionByDefault?: boolean;
    labelPosition?: "above" | "inline";
    labelAlignment?: "left" | "right";
    label?: string;
    disable?: boolean;
  }>(),
  {
    selectFirstOptionByDefault: false,
    labelPosition: "above",
    labelAlignment: "left",
    disable: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption): void;
}>();

const { t } = useI18n();
const defaultOption: DropdownOption = {
  icon: DamsIcons.AngleDown,
  label: props.label ? props.label : "dropdown.select-option",
  value: "",
};
const selectedItem = ref<DropdownOption>(defaultOption);
const selectedItemLabel = computed(() => selectedItem.value.label);

const selectItem = (event: Event) => {
  const newlySelectedOption = props.options.find(
    (option: DropdownOption) => option.label === event.target?.value
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

onMounted(() => {});

watch(
  () => props.options,
  () => {
    if (props.options.length > 0)
      if (props.selectFirstOptionByDefault) {
        selectedItem.value = props.options[0];
        emit("update:modelValue", selectedItem.value);
      }
  },
  { immediate: true }
);
watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) return;
    if (typeof props.modelValue === "string") {
      selectedItem.value = props.options.find(
        (option: DropdownOption) => option.value === props.modelValue
      );
      return;
    }
    selectedItem.value = props.modelValue;
  },
  { immediate: true }
);
</script>
