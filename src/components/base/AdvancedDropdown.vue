<template>
  <div
    data-cy="base-dropdown-new"
    :aria-busy="loading ? 'true' : undefined"
    :class="[
      labelPosition === 'inline' ? 'flex items-center' : undefined,
      dropdownStyle,
      'vue-advanced-select',
    ]"
    :style="{
      minWidth: shouldCalculateWidth ? `${calculatedWidth}px` : 'auto',
    }"
  >
    <VueSelect
      class="!text-text-body !bg-background-light border-none !rounded-input text-value flex-1 min-w-0"
      v-model="selectedItem"
      :teleport="someModalIsOpened ? modalTeleportTarget() : 'body'"
      :options="selectOptions"
      :placeholder="label"
      :is-disabled="disable"
      :is-multi="multiple"
      :is-clearable="clearable"
      :is-searchable="filterDropdownOptions.length > SEARCH_THRESHOLD"
      :is-loading="loading"
      :close-on-select="!multiple"
      :hide-selected-options="false"
      :should-autofocus-option="false"
      @option-deselected="deselectItem"
      @update:modelValue="handleUpdateItem"
      :classes="{
        menuContainer: `border border-border-subtle rounded-card shadow-overlay !mt-0 !z-header`,
      }"
    >
      <!-- vue3-select-component renders this slot as a component with
           hyphenated props ("is-selected"), so the selection is read from
           our own state instead of the slot's isSelected. -->
      <template #option="{ option }">
        <input
          v-if="multiple"
          type="checkbox"
          class="mr-2 pointer-events-none"
          :class="CHECKBOX_BOX_CLASSES"
          :checked="isOptionSelected(option)"
          tabindex="-1"
          aria-hidden="true"
        />
        <div
          v-else-if="isOptionSelected(option)"
          data-cy="option-check"
          class="mr-2 w-[18px] h-[18px]"
        >
          <unicon :name="Unicons.Check.name" height="18" width="18" />
        </div>
        <div v-else class="mr-2">
          <unicon
            v-if="option.icon && Unicons[option.icon]?.name"
            :name="Unicons[option.icon].name"
            height="24"
            width="24"
          />
        </div>
        <div
          v-if="option.value === NO_VALUE"
          class="text-text-placeholder"
        >
          — {{ option.label }}
        </div>
        <div v-else class="text-text-body">
          <SanitizedHtml
            :mode="SanitizeMode.Html"
            :content="t(option.label)"
          ></SanitizedHtml>
        </div>
      </template>
      <template #value="{ option }">
        <div class="selectedOption flex items-center">
          <unicon
            v-if="addIconToValue && option.icon && Unicons[option.icon]?.name"
            class="mx-1"
            :name="Unicons[option.icon].name"
            height="18"
            width="18"
          />
          <p class="text-center">
            {{ addLabelToValue ? label : "" }}{{ addLabelToValue ? ":" : "" }}
            {{ stripHighlightTags(t(option.label)) }}
          </p>
        </div>
      </template>
      <!-- Multi select summarises the selection as one count, rendered
           in the first tag slot only. -->
      <template #tag="{ option }">
        <span
          v-if="isFirstSelected(option)"
          data-cy="dropdown-count"
          class="selectedOption px-1"
        >
          {{ selectedCountLabel }}
        </span>
      </template>
      <template #no-options>
        <div v-if="loading" aria-hidden="true" class="py-1">
          <div
            v-for="row in 3"
            :key="row"
            data-cy="option-skeleton"
            class="mx-2.5 my-2 h-2.5 rounded-chip bg-surface-sunken animate-pulse"
            :style="{ width: `${90 - row * 15}%` }"
          ></div>
        </div>
        <div v-else class="px-2.5 py-[5px] text-table text-text-muted">
          {{ noOptionsLabel }}
        </div>
      </template>
    </VueSelect>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, inject, onMounted } from "vue";
import {
  ActionContextEntitiesSelectionType,
  ActionContextViewModeTypes,
  SanitizeMode,
  type DropdownOption,
} from "@/generated-types/queries";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import { CHECKBOX_BOX_CLASSES } from "@/components/base/checkboxStyles";
import { stripHighlightTags } from "@/helpers";
import { useEditMode } from "@/composables/useEdit";
import { useRoute } from "vue-router";
import VueSelect from "vue3-select-component";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useBaseModal } from "@/composables/useBaseModal";
import { modalTeleportTarget } from "@/composables/useModalTeleportTarget";
import { useEmptyValueLabel } from "@/composables/useEmptyValueLabel";

type DropdownStyle = "default" | "defaultWithBorder" | "defaultWithLightBorder";

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
    loading?: boolean;
    styleType?: DropdownStyle;
    alwaysCalcualteWidth?: boolean;
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
    loading: false,
    styleType: "default",
    alwaysCalcualteWidth: false,
  },
);

const emit = defineEmits<{
  (
    event: "update:modelValue",
    modelValue: DropdownOption | number | string | string[] | undefined,
  ): void;
}>();

const route = useRoute();
const { t, te } = useI18n();
const emptyValueLabel = useEmptyValueLabel();
const noOptionsLabel = computed<string>(() =>
  te("dropdown.no-options") ? t("dropdown.no-options") : "No options",
);

// Search appears only once the list is long enough to need it.
const SEARCH_THRESHOLD = 10;
// Sentinel for the leading "— Geen waarde" option; picking it clears.
const NO_VALUE = "__elody-no-value__";
const entityFormData: any = inject("entityFormData");
const entityId = computed<string>(() => entityFormData?.id || route.params.id);
const { isEdit } = useEditMode(entityId.value);
const { someModalIsOpened } = useBaseModal();
const selectedItem = ref<any | any[] | undefined>(undefined);

const deselectItem = () => {
  emit("update:modelValue", "");
};

const handleUpdateItem = (value: any) => {
  if (value === NO_VALUE) {
    selectedItem.value = undefined;
    emit("update:modelValue", "");
    return;
  }
  if (!value && !props.clearable)
    selectedItem.value = selectedItem.value || props.options[0].value;
  emit("update:modelValue", selectedItem.value);
};

const dropdownStyle = computed<string>(() => {
  const stylesMap: Record<DropdownStyle, string> = {
    default: "",
    defaultWithBorder: "vue-advanced-select--bordered",
    defaultWithLightBorder: "vue-advanced-select--light-bordered",
  };

  return stylesMap[props.styleType];
});

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

// Non-required single selects start with "— Geen waarde".
const selectOptions = computed<DropdownOption[]>(() => {
  if (props.multiple || !props.clearable) return filterDropdownOptions.value;
  return [
    { label: emptyValueLabel.value, value: NO_VALUE } as DropdownOption,
    ...filterDropdownOptions.value,
  ];
});

const selectedValues = computed<any[]>(() =>
  Array.isArray(selectedItem.value) ? selectedItem.value : [],
);
const isOptionSelected = (option: DropdownOption): boolean =>
  props.multiple
    ? selectedValues.value.includes(option.value)
    : selectedItem.value !== undefined &&
      selectedItem.value !== null &&
      selectedItem.value === option.value;
const isFirstSelected = (option: any): boolean =>
  selectedValues.value[0] === option.value;
const selectedCountLabel = computed<string>(() => {
  const count = selectedValues.value.length;
  return te("dropdown.n-selected")
    ? t("dropdown.n-selected", { n: count })
    : `${count} selected`;
});

const shouldCalculateWidth = ref(false);
const calculatedWidth = ref(200);

const checkIfCalculationNeeded = () => {
  if (props.alwaysCalcualteWidth) {
    shouldCalculateWidth.value = true;
    return;
  }

  shouldCalculateWidth.value =
    props.options.length > 0 && props.options.length <= 20;
};

const calculateWidth = () => {
  if (!shouldCalculateWidth.value) return;

  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.style.font = `
    ${getComputedStyle(document.body).getPropertyValue("--vs-font-weight")} 
    ${getComputedStyle(document.body).getPropertyValue("--vs-font-size")} 
    ${getComputedStyle(document.body).getPropertyValue("--vs-font-family")}
  `;

  document.body.appendChild(span);

  let maxWidth = 0;
  props.options.forEach((option) => {
    span.textContent = stripHighlightTags(t(option.label));
    maxWidth = Math.max(maxWidth, span.offsetWidth);
  });

  document.body.removeChild(span);
  calculatedWidth.value = maxWidth + 56;
};

onMounted(() => {
  checkIfCalculationNeeded();
  calculateWidth();
});

watch(
  () => props.options.length,
  () => {
    checkIfCalculationNeeded();
    calculateWidth();
  },
);

watch(
  () => props.options,
  () => {
    if (props.options.length === 0 || !props.selectFirstOptionByDefault) return;
    selectedItem.value = props.options[0].value;
    emit("update:modelValue", selectedItem.value);
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
@reference "@/assets/main.css";

/* Design-system theme for vue3-select-component. The library declares its
   defaults on :root; re-declaring them on body wins by inheritance whatever
   the stylesheet order, and also reaches the teleported menu. */
body {
  --vs-font-family: var(--font-sans);
  --vs-font-size: var(--text-value);
  --vs-line-height: 1.375;
  --vs-text-color: var(--color-text-body);
  --vs-placeholder-color: var(--color-text-placeholder);
  --vs-background-color: var(--color-surface);
  --vs-disabled-background-color: var(--color-surface-muted);
  --vs-border: 1px solid var(--color-border-default);
  --vs-border-radius: var(--radius-input);
  --vs-padding: 5px 8px;
  --vs-min-height: var(--control-height);
  --vs-outline-width: var(--focus-ring-width);
  --vs-outline-color: var(--color-focus-ring);
  --vs-indicator-icon-color: var(--color-text-secondary);
  --vs-indicator-icon-size: 16px;
  --vs-spinner-color: var(--color-commit);
  --vs-menu-border: 1px solid var(--color-border-subtle);
  --vs-menu-box-shadow: var(--shadow-overlay);
  --vs-menu-offset-top: 4px;
  --vs-option-font-size: var(--text-table);
  --vs-option-padding: 5px 10px;
  --vs-option-text-color: var(--color-text-body);
  --vs-option-hover-background-color: var(--color-accent-wash);
  --vs-option-hover-text-color: var(--color-text-body);
  --vs-option-focused-background-color: var(--color-accent-wash);
  --vs-option-focused-text-color: var(--color-text-body);
  --vs-option-selected-background-color: transparent;
  --vs-option-selected-text-color: var(--color-text-body);
  --vs-option-disabled-background-color: transparent;
  --vs-option-disabled-text-color: var(--color-text-disabled);
  --vs-multi-value-background-color: var(--color-chip-relation-bg);
  --vs-multi-value-label-text-color: var(--color-chip-relation-text);
  --vs-multi-value-border-radius: var(--radius-chip);
  --vs-multi-value-label-font-size: var(--text-label);
}

body > .menu {
  --vs-menu-z-index: var(--z-dropdown) !important;
}

.vue-advanced-select .search-input:focus {
  outline: none !important;
  box-shadow: none;
}

/* default: borderless field on the light surface */
.vue-advanced-select .vue-select,
.vue-advanced-select .control {
  --vs-border: none;
}

.vue-advanced-select--bordered .vue-select,
.vue-advanced-select--bordered .control {
  --vs-border: 1px solid var(--color-border-default);
}

.vue-advanced-select--bordered .control:hover:not(.focused) {
  --vs-border: 1px solid var(--color-border-dashed);
}

.vue-advanced-select--light-bordered .vue-select,
.vue-advanced-select--light-bordered .control {
  --vs-border: 1px solid var(--color-border-subtle);
}

.vue-advanced-select .control.focused {
  box-shadow: none !important;
}

.vue-advanced-select .selectedOption {
  color: var(--color-text-body);
}
</style>
