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
      class="!text-text-body !bg-neutral-white border-none !rounded-lg"
      v-model="selectedItem"
      :teleport="someModalIsOpened ? undefined : 'body'"
      :options="filterDropdownOptions"
      :placeholder="label"
      :is-disabled="disable"
      :is-multi="multiple"
      :is-clearable="clearable"
      :should-autofocus-option="false"
      @option-deselected="deselectItem"
      @update:modelValue="handleUpdateItem"
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
    styleType: DropdownStyle;
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
const selectedItem = ref<any | undefined>(undefined);

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

const shouldCalculateWidth = ref(false);
const calculatedWidth = ref(200);

const checkIfCalculationNeeded = () => {
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
@reference "@/assets/main.css"

:deep(.vue-select) {
  --vs-border-radius: 10px;
}

body > .menu {
  --vs-menu-z-index: 9999 !important;
}

div.menu-option.selected {
  background-color: var(--color-neutral-light) !important;
}

div.menu-option {
  line-height: 1.375;
}

div.menu-option:hover {
  background-color: color-mix(
    in srgb,
    var(--color-neutral-light) 30%,
    transparent
  ) !important;
}

.vue-advanced-select .search-input {
  &:focus {
    outline: none !important;
    box-shadow: none;
  }
}

.vue-advanced-select .menu {
  --vs-menu-z-index: 9999 !important;
}

.vue-advanced-select .vue-select,
.vue-advanced-select .control {
  --vs-border-radius: 0.5rem;
  --vs-border: none;
  --vs-line-height: 1.375;
}

.vue-advanced-select .control.focused {
  --vs-outline-color: none;
}

.vue-advanced-select--bordered .vue-select,
.vue-advanced-select--bordered .control {
  --vs-border-radius: 0.5rem;
  --vs-border: 1px solid rgba(0, 58, 82, 0.6);
}

.vue-advanced-select .control.focused {
  --vs-outline-color: none;
}

.vue-advanced-select--light-bordered .vue-select,
.vue-advanced-select--light-bordered .control {
  --vs-border-radius: 0.5rem;
  --vs-border: 1px solid #e8eef0;
  --vs-line-height: 1.375;
}

.vue-advanced-select--light-bordered .control.focused {
  --vs-outline-color: #e8eef0;
  box-shadow: none !important;
}

.vue-advanced-select .selectedOption {
  @apply text-text-body;
}

.vue-advanced-select--bordered .selectedOption {
  @apply text-black;
}
</style>
