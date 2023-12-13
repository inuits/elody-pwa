<template>
  <div v-if="options.length" :class="[labelPosition === 'inline' ? 'flex items-center' : undefined]">
  <p :class="['pr-2']" v-if="label">{{t(label)}}</p>
  <select :class="['cursor-pointer', dropdownStyles[dropdownStyle].style, 'max-w-full']" v-model="selectedItemLabel">
    <option v-for="option in [defaultOption, ...options]" :key="option.value" :value="option.label" @click="selectItem(option)" :class="[dropdownStyles[dropdownStyle].hoverStyle]">{{t(option.label)}}</option>
  </select>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

type Dropdown = {
  style: string
  hoverStyle: string;
  disabledStyle: string;
};

const defaultDropdown: Dropdown = {
  style: "text-text-body bg-neutral-white border-none rounded-lg",
  hoverStyle: "hover:text-accent-accent hover:bg-neutral-lightest hover:border-none",
  disabledStyle: "text-text-disabled bg-neutral-lightest border-none"
};
const defaultFullWidthDropdown: Dropdown = {
  style: "text-text-body bg-neutral-white border-none rounded-lg w-full",
  hoverStyle: "hover:text-accent-accent hover:bg-neutral-lightest hover:border-none",
  disabledStyle: "text-text-disabled bg-neutral-lightest border-none"
};
const defaultWithBorderDropdown: Dropdown = {
  style: "text-text-body bg-neutral-white border-[rgba(0,58,82,0.6)] rounded-lg w-full",
  hoverStyle: "hover:text-accent-accent hover:bg-neutral-lightest hover:border-[rgba(0,58,82,0.6)]",
  disabledStyle: "text-text-disabled bg-neutral-lightest border-text-disabled",
};
const accentAccentDropdown: Dropdown = {
  style: "text-neutral-white bg-accent-accent border-none rounded-lg",
  hoverStyle: defaultDropdown.hoverStyle,
  disabledStyle: defaultDropdown.disabledStyle,
};
const neutralLightDropdown: Dropdown = {
  style: "text-text-body bg-neutral-light border-none rounded-lg",
  hoverStyle: "hover:text-[rgba(0,58,82,0.8)] hover:bg-neutral-lightest hover:border-none",
  disabledStyle: defaultDropdown.disabledStyle,
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
    modelValue: DropdownOption | undefined;
    options: DropdownOption[];
    dropdownStyle: DropdownStyle;
    labelPosition?: "above" | "inline";
    labelAlignment?: "left" | "right";
    label?: string;
    disable?: boolean;
  }>(),
  {
    labelPosition: "above",
    labelAlignment: "left",
    disable: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption): void;
}>();

const {t} = useI18n()
const defaultOption: DropdownOption = {
  icon: DamsIcons.AngleDown,
  label: props.label ? props.label : "dropdown.select-option",
  value: "",
}
const selectedItem = ref<DropdownOption>(defaultOption)
const selectedItemLabel = computed(() => selectedItem.value.label)

const selectItem = (option:DropdownOption) => {
  if (option === selectedItem.value) return
  selectedItem.value = option
  emit('update:modelValue', option)
}

watch(() => props.modelValue, () => {
  if (!props.modelValue) return
  selectedItem.value = props.modelValue
}, {immediate: true} )
</script>
