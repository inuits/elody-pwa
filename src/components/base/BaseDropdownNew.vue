<template>
  <span
    v-if="label && labelPosition === 'above'"
    class="text-sm text-text-light ml-1"
  >
    {{ label }}
  </span>
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
            v-if="
              labelPosition === 'inline' &&
              selectedOptionIsNotDefaultOption &&
              labelAlignment === 'left'
            "
            >{{ label }}
          </span>
          {{ selectedOptionLabel }}
          <span
            v-if="
              labelPosition === 'inline' &&
              selectedOptionIsNotDefaultOption &&
              labelAlignment === 'right'
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
      class="absolute z-10 rounded-b-lg border-x border-b"
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
        <span>{{ optionLabel(option) }}</span>
      </li>
    </div>
  </ul>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from "vue";
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";
import { Unicons } from "@/types";
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
    bgColor: "hover:bg-neutral-lightest",
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
  borderColor: "border-[rgba(0,58,82,0.6)]",
  hoverStyle: {
    textColor: defaultDropdown.hoverStyle.textColor,
    bgColor: defaultDropdown.hoverStyle.bgColor,
    borderColor: "hover:border-[rgba(0,58,82,0.6)]",
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
    modelValue: DropdownOption | string | undefined;
    options: DropdownOption[];
    dropdownStyle: DropdownStyle;
    label?: string;
    labelPosition?: "above" | "inline";
    labelAlignment?: "left" | "right";
    defaultLabel?: string;
    disable?: boolean;
  }>(),
  {
    label: "",
    labelPosition: "above",
    labelAlignment: "left",
    disable: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption | string): void;
}>();

const { t } = useI18n();
const defaultOption: DropdownOption = {
  icon: DamsIcons.AngleDown,
  label: props.defaultLabel ? props.defaultLabel : t("dropdown.select-option"),
  value: "",
};
const dropdown = ref<HTMLUListElement>();
const { modelValue } = toRefs(props);
const selectedOption = ref<DropdownOption>(defaultOption);
const showOptions = ref<boolean>(false);
const disable = ref<boolean>(props.disable);

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

const label = computed<string>(() => {
  try {
    return t(props.label);
  } catch {
    return props.label;
  }
});
const selectedOptionLabel = computed<string>(() => {
  try {
    return t(selectedOption.value.label);
  } catch {
    return selectedOption.value.label;
  }
});
const optionLabel = (option: DropdownOption) => {
  try {
    return t(option.label);
  } catch {
    return option.label;
  }
};

const selectedOptionIsNotDefaultOption = computed<boolean>(() => {
  console.log(selectedOption.value, defaultOption);
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

onMounted(() => document.addEventListener("click", collapseDropdown));
onUnmounted(() => document.removeEventListener("click", collapseDropdown));

watch(
  modelValue,
  (value) => {
    value === undefined
      ? (selectedOption.value = defaultOption)
      : typeof value === "string"
      ? (selectedOption.value = {
          icon: DamsIcons.NoIcon,
          label: value,
          value: value,
        })
      : (selectedOption.value = value);
  },
  { immediate: true }
);
watch(selectedOption.value, (value) => {
  if (selectedOptionIsNotDefaultOption.value)
    if (typeof props.modelValue === "string") emit("update:modelValue", value);
    else {
      emit("update:modelValue", value);
    }
});
</script>

<style>
.extra_width {
  width: calc(100% + 2px);
}
</style>
