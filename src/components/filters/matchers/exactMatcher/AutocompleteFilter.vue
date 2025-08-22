<template>
  <BaseInputAutocomplete
    v-model="selectedOptions"
    :options="options"
    autocomplete-style="default"
    :placeholder="placeholder"
    :no-options-text="noOptionsText"
    :loading="isLoading"
    @search-change="debouncedHandleSearchChange"
    :search-filter="
      function (option: any) {
        return option;
      }
    "
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";
import debounce from "lodash.debounce";

const props = defineProps<{
  filter: FilterListItem;
  options: DropdownOption[];
  initialInputValue?: string;
  isLoading?: boolean;
}>();

const emit = defineEmits(["updateValue", "newInputValue", "searchOptions"]);

const { t } = useI18n();

onMounted(async () => {
  applyInitialValue(props.options);

  if (props.initialInputValue) {
    searchQuery.value = props.initialInputValue;
  }
});

const selectedOptions = ref<DropdownOption[]>([]);
const searchQuery = ref("");

const minDropdownSearchCharacters = computed(
  () => props.filter.advancedFilter.minDropdownSearchCharacters || 3,
);

const placeholder = computed(() => t("filters.matcher-placeholders.keyword"));
const noOptionsText = computed(() =>
  searchQuery.value.length <= minDropdownSearchCharacters.value
    ? t("filters.minDropdownSearchCharacters")
    : undefined,
);

const debouncedHandleSearchChange = debounce((value: string) => {
  searchQuery.value = value;
  emit(
    "searchOptions",
    value?.length >= minDropdownSearchCharacters.value ? value : "",
  );
}, 250);

watch(selectedOptions, (newValue) => {
  emit(
    "updateValue",
    newValue.map((option) => option.value),
    false,
  );
});

const getActiveValuesArray = (): string[] => {
  if (Array.isArray(props.filter.inputFromState?.value))
    return props.filter.inputFromState?.value;
  else if (props.filter.inputFromState?.value)
    return [props.filter.inputFromState?.value];
  return [];
};

const applyInitialValue = (options: DropdownOption[]) => {
  const activeValues: string[] = getActiveValuesArray();

  activeValues.forEach((value) => {
    const option = options.find((opt) => opt.value === value) ?? {
      label: value,
      value,
    };
    selectedOptions.value.push(option);
  });
};

const reset = () => {
  selectedOptions.value = [];
};

defineExpose({
  reset,
});
</script>
