<template>
  <div
    data-cy="base-dropdown-new"
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
      class="flex-1 min-w-0"
      v-model="selectedItem"
      :teleport="someModalIsOpened ? '.base-modal--opened' : 'body'"
      :options="filterDropdownOptions"
      :placeholder="label"
      :is-disabled="disable"
      :is-multi="multiple"
      :is-clearable="clearable"
      :is-searchable="isSearchable"
      :close-on-select="!multiple"
      :should-autofocus-option="false"
      @option-deselected="deselectItem"
      @update:modelValue="handleUpdateItem"
      :classes="{ menuContainer: 'elody-dropdown-menu' }"
    >
      <template #option="{ option }">
        <div v-if="option.value !== selectedItem" class="mr-2">
          <unicon
            v-if="option.icon && Unicons[option.icon]?.name"
            :name="Unicons[option.icon].name"
            height="24"
            width="24"
          />
        </div>
        <div v-else class="mr-2 w-[18px] h-[18px]">
          <unicon :name="Unicons.Check.name" height="18" width="18" />
        </div>
        <div class="text-text-body">
          {{ t(option.label) }}
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
            {{ t(option.label) }}
          </p>
        </div>
      </template>
      <template #tag="{ option }">
        <div class="elody-dropdown-tag">
          <span class="elody-dropdown-tag__label">{{ t(option.label) }}</span>
          <button
            class="elody-dropdown-tag__remove"
            type="button"
            :aria-label="t('dropdown.remove-option', { option: t(option.label) })"
            @click="() => removeOptionFromListOfOptions(option)"
          >
            &times;
          </button>
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
  type DropdownOption,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { useRoute } from "vue-router";
import VueSelect from "vue3-select-component";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useBaseModal } from "@/composables/useBaseModal";

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
    showMenuHeader?: boolean;
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
    showMenuHeader: true,
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
const { t } = useI18n();
const entityFormData: any = inject("entityFormData");
const entityId = computed<string>(() => entityFormData?.id || route.params.id);
const { isEdit } = useEditMode(entityId.value);
const { someModalIsOpened } = useBaseModal();
const selectedItem = ref<any | any[] | undefined>(undefined);

const deselectItem = () => {
  emit("update:modelValue", "");
};

const handleUpdateItem = (value: any) => {
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

/**
 * A list short enough to read at a glance does not get a search field; past ten
 * options the search-in-list pill appears (dropdown-select.md).
 */
const isSearchable = computed(() => filterDropdownOptions.value.length > 10);

const removeOptionFromListOfOptions = (option: any) => {
  if (!Array.isArray(selectedItem.value)) return;
  selectedItem.value = selectedItem.value.filter(
    (selectedOption) => selectedOption !== option.value,
  );
  emit("update:modelValue", selectedItem.value);
};

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
    span.textContent = t(option.label);
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
/* Not scoped: the menu teleports to <body>, so it is styled by its own class
   rather than through this component's tree. */

.vue-advanced-select .vue-select,
.vue-advanced-select .control {
  --vs-border-radius: var(--radius-input);
  --vs-border: 1px solid transparent;
  --vs-line-height: 1.375;
  --vs-font-size: var(--text-value);
  --vs-text-color: var(--color-text-body);
  --vs-placeholder-color: var(--color-text-placeholder);
  --vs-background-color: var(--color-surface);
  /* The one focus treatment in the system; the previous `none` left the
     control with no visible focus at all. */
  --vs-outline-color: var(--color-focus-ring);
  --vs-outline-width: 2px;
}

.vue-advanced-select--bordered .vue-select,
.vue-advanced-select--bordered .control {
  --vs-border: 1px solid var(--color-border-default);
}

.vue-advanced-select--light-bordered .vue-select,
.vue-advanced-select--light-bordered .control {
  --vs-border: 1px solid var(--color-border-subtle);
}

.vue-advanced-select .selectedOption {
  color: var(--color-text-body);
}

/* ── The teleported menu ──────────────────────────────────────────────── */

/* The library's own rules carry a scoped-attribute selector and outrank a
   plain class, so the menu is themed through the variables they read. */
.elody-dropdown-menu {
  --vs-menu-z-index: var(--z-dropdown);
  --vs-menu-offset-top: 0;
  --vs-border-radius: var(--radius-card);
  --vs-menu-border: 1px solid var(--color-border-default);
  --vs-menu-box-shadow: var(--shadow-overlay);
  --vs-menu-background-color: var(--color-surface);
  --vs-option-font-size: var(--text-table);
  --vs-option-text-color: var(--color-text-body);
  --vs-option-hover-background-color: var(--color-surface-editable-hover);
  --vs-option-hover-text-color: var(--color-text-body);
  --vs-option-selected-background-color: var(--color-accent-highlight);
  --vs-option-selected-text-color: var(--color-text-body);
  --vs-option-focused-background-color: var(--color-surface-editable-hover);
  --vs-option-focused-text-color: var(--color-text-body);
}

.elody-dropdown-menu .menu-option {
  line-height: 1.375;
}

/* ── Multi-select tags ────────────────────────────────────────────────── */

.vue-advanced-select .elody-dropdown-tag {
  display: flex;
  align-items: center;
  margin: var(--spacing-ds-1);
  border-radius: var(--radius-chip);
  background-color: var(--color-chip-neutral-bg);
  color: var(--color-chip-neutral-text);
}

.vue-advanced-select .elody-dropdown-tag__label {
  padding: var(--spacing-ds-1) var(--spacing-ds-6);
  font-size: var(--text-label);
}

.vue-advanced-select .elody-dropdown-tag__remove {
  padding: 0 var(--spacing-ds-6);
  border-radius: 0 var(--radius-chip) var(--radius-chip) 0;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.vue-advanced-select .elody-dropdown-tag__remove:hover {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}
</style>
