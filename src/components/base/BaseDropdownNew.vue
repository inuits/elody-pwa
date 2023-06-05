<template>
  <ul
    ref="dropdown"
    class="relative w-full h-full px-3 select-none border"
    :class="[
      `${selectedDropdownStyle.textColor} ${selectedDropdownStyle.bgColor} ${selectedDropdownStyle.borderColor}`,
      showOptions ? 'rounded-t-lg' : 'rounded-lg',
      disabled
        ? `${selectedDropdownStyle.disabledStyle.textColor} ${selectedDropdownStyle.disabledStyle.bgColor} ${selectedDropdownStyle.disabledStyle.borderColor}`
        : '',
    ]"
  >
    <li
      @click="() => (!disabled ? (showOptions = !showOptions) : undefined)"
      class="flex justify-between h-full py-1"
      :class="disabled ? 'cursor-normal' : 'cursor-pointer'"
    >
      <div class="flex justify-start items-center">
        <unicon
          v-if="
            selectedOption.icon !== 'NoIcon' && selectedOptionIsNotDefaultOption
          "
          :name="Unicons[selectedOption.icon].name"
          class="h-5 mr-2 -ml-0.5"
        />
        <span>
          <span
            v-if="selectedOptionIsNotDefaultOption && labelAlignment === 'left'"
            >{{ label }}
          </span>
          {{ selectedOption.label }}
          <span
            v-if="
              selectedOptionIsNotDefaultOption && labelAlignment === 'right'
            "
          >
            {{ label }}</span
          >
        </span>
      </div>
      <div class="flex justify-end items-center">
        <unicon :name="Unicons[arrowIcon].name" class="ml-2 -mr-1" />
      </div>
    </li>
    <div
      v-show="showOptions"
      class="absolute z-0 rounded-b-lg border-x border-b"
      :class="[
        `${selectedDropdownStyle.textColor} ${selectedDropdownStyle.bgColor} ${selectedDropdownStyle.borderColor}`,
        `${selectedDropdownStyle.borderColor}` !== 'border-none'
          ? 'extra_width -mx-[13px]'
          : 'w-full -mx-[12px]',
      ]"
    >
      <li
        v-for="option in options"
        :key="option.value"
        class="flex h-full px-3 py-1.5 items-center last:rounded-b-lg transition-colors duration-300"
        :class="[
          `${selectedDropdownStyle.hoverStyle.textColor} ${selectedDropdownStyle.hoverStyle.bgColor} ${selectedDropdownStyle.hoverStyle.borderColor}`,
          disabled ? 'cursor-normal' : 'cursor-pointer',
        ]"
        @click="selectOption(option)"
      >
        <unicon
          v-if="option.icon !== 'NoIcon'"
          :name="Unicons[option.icon].name"
          class="h-5 mr-2 -ml-0.5"
        />
        <span>{{ option.label }}</span>
      </li>
    </div>
  </ul>
</template>

<script lang="ts" setup>
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";

type PseudoStyle = {
  textColor: string;
  bgColor: string;
  borderColor: string;
};
type Dropdown = {
  textColor: string;
  bgColor: string;
  borderColor: string;
  hoverStyle: PseudoStyle;
  disabledStyle: PseudoStyle;
};
const defaultDropdown: Dropdown = {
  textColor: "text-text-body",
  bgColor: "bg-neutral-white",
  borderColor: "border-none",
  hoverStyle: {
    textColor: "hover:text-accent-accent",
    bgColor: "hover:bg-accent-light",
    borderColor: "hover:border-none",
  },
  disabledStyle: {
    textColor: "text-text-disabled",
    bgColor: "bg-neutral-lightest",
    borderColor: "border-none",
  },
};
const defaultWithBorderDropdown: Dropdown = {
  textColor: defaultDropdown.textColor,
  bgColor: defaultDropdown.bgColor,
  borderColor: "border-text-body",
  hoverStyle: {
    textColor: defaultDropdown.hoverStyle.textColor,
    bgColor: defaultDropdown.hoverStyle.bgColor,
    borderColor: "hover:border-text-body",
  },
  disabledStyle: {
    textColor: defaultDropdown.disabledStyle.textColor,
    bgColor: defaultDropdown.disabledStyle.bgColor,
    borderColor: "border-text-disabled",
  },
};
const accentAccentDropdown: Dropdown = {
  textColor: "text-neutral-white",
  bgColor: "bg-accent-accent",
  borderColor: "border-none",
  hoverStyle: defaultDropdown.hoverStyle,
  disabledStyle: defaultDropdown.disabledStyle,
};

type DropdownStyle = "default" | "defaultWithBorder" | "accentAccent";
const dropdownStyles: Record<DropdownStyle, Dropdown> = {
  default: defaultDropdown,
  defaultWithBorder: defaultWithBorderDropdown,
  accentAccent: accentAccentDropdown,
};

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption | undefined;
    options: DropdownOption[];
    label?: string;
    defaultLabel?: string;
    labelAlignment?: "left" | "right";
    dropdownStyle: DropdownStyle;
    disable?: boolean;
  }>(),
  {
    label: "",
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
  label: props.defaultLabel ? props.defaultLabel : t("dropdown.select-option"),
  value: "",
};
const dropdown = ref<HTMLUListElement>();
const { modelValue } = toRefs(props);
const selectedOption = ref(defaultOption);
const showOptions = ref(false);
const disable = ref(props.disable);

const selectOption = (dropdownOption: DropdownOption) => {
  selectedOption.value = dropdownOption;
  showOptions.value = false;
};

const selectedDropdownStyle = computed<Dropdown>(
  () => dropdownStyles[props.dropdownStyle]
);
const arrowIcon = computed<DamsIcons>(() =>
  showOptions.value ? DamsIcons.AngleUp : DamsIcons.AngleDown
);
const disabled = computed<Boolean>(() =>
  props.options.length > 0 ? disable.value : true
);

const selectedOptionIsNotDefaultOption = computed<boolean>(() => {
  return (
    selectedOption.value.icon !== defaultOption.icon &&
    selectedOption.value.label !== defaultOption.label &&
    selectedOption.value.value !== defaultOption.value
  );
});

const collapseDropdown = (event: MouseEvent) => {
  if (!dropdown.value?.contains(event.target as Node))
    showOptions.value = false;
};

watch(modelValue, (value) =>
  value === undefined
    ? (selectedOption.value = defaultOption)
    : (selectedOption.value = value)
);
watch(selectedOption, (value) => {
  if (selectedOptionIsNotDefaultOption.value) emit("update:modelValue", value);
});

onMounted(() => document.addEventListener("click", collapseDropdown));
onUnmounted(() => document.addEventListener("click", collapseDropdown));
</script>

<style>
.extra_width {
  width: calc(100% + 2px);
}
</style>
