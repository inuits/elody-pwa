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
import { debounce } from "@/helpers";

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
}, 300);

watch(selectedOptions, (newValue) => {
  emit(
    "updateValue",
    newValue.map((option) => option.value),
    false,
  );
});

const applyInitialValue = (options: DropdownOption[]) => {
  const activeValues: string[] = props.filter.inputFromState?.value || [];

  activeValues.forEach((value) => {
    const existingOption = options.find((opt) => opt.value === value);

    if (existingOption) {
      selectedOptions.value.push(existingOption);
    } else {
      selectedOptions.value.push({
        label: value,
        value: value,
      });
    }
  });
};
</script>
