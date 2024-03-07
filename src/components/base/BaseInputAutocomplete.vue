<template>
  <Multiselect
    v-if="inputValue"
    v-model="inputValue"
    :mode="selectType === 'multi' ? 'tags' : 'single'"
    :options="options"
    :searchable="searchable"
    :show-options="searchable"
    :close-on-select="true"
    :classes="classes"
    :disabled="disabled"
    :object="true"
    label="label"
    valueProp="value"
    @search-change="(value: string) => {
        searchValue = value;
        emit('searchChange', value);
      }"
  />
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import Multiselect from "@vueform/multiselect";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

type AutocompleteStyle = "default" | "defaultWithBorder";

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption[] | undefined;
    options: DropdownOption[];
    autocompleteStyle: AutocompleteStyle;
    selectType?: "multi" | "single";
    placeholder?: string;
    disabled?: boolean;
    relation?: boolean;
  }>(),
  {
    selectType: "multi",
    placeholder: "",
    disabled: false,
    relation: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption[] | undefined): void;
  (event: "searchChange", value: string): void;
}>();

const { t } = useI18n();
const classes = ref();
const searchValue = ref<string>();

const inputValue = computed<DropdownOption[] | undefined>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const searchable = computed<boolean>(() => {
  return (
    !inputValue.value ||
    inputValue.value[0]?.value === "" ||
    props.selectType === "multi" ||
    (props.selectType === "single" && inputValue.value.length < 1)
  );
});

const setClasses = () => {
  classes.value =
    !inputValue.value ||
    inputValue.value.length <= 0 ||
    inputValue.value[0]?.value === ""
      ? { tags: "multiselect-tags multiselect-tags-margin" }
      : {};

  if (props.autocompleteStyle === "defaultWithBorder") {
    classes.value["container"] = "multiselect multiselect-border";
    classes.value["dropdown"] =
      "multiselect-dropdown multiselect-dropdown-border";
  }
};

onMounted(() => setClasses());

watch(
  () => [inputValue.value, props.options],
  () => setClasses()
);
</script>

<style>
@import "@vueform/multiselect/themes/tailwind.css";

.multiselect-search {
  border: none;
}

.multiselect-search:focus {
  border: none;
  border-color: transparent;
  outline: none;
}
</style>
