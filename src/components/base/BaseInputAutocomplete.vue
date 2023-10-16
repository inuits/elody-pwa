<template>
  <Multiselect
    v-if="inputValue"
    v-model="inputValue"
    mode="tags"
    :options="options"
    :searchable="searchable"
    :show-options="searchable"
    :close-on-select="true"
    :placeholder="placeholder"
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
.multiselect {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 2px 3px;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: text;
  outline: none;
  background: var(--color-neutral-white);
}

.multiselect.is-open {
  border-radius: 0;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.multiselect.is-active {
  outline: none;
}

.multiselect-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 0 auto;
  width: 100%;
  outline: none;
  cursor: pointer;
}

.multiselect-placeholder {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  line-height: 1.375rem;
  max-width: 100%;
  padding-left: 0.875rem;
  padding-right: calc(1.25rem + 0.875rem * 3);
  align-items: center;
}

.multiselect-placeholder {
  color: var(--color-text-placeholder);
}

.multiselect-tags {
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-wrap: wrap;
  padding-top: 2px;
  padding-left: 8px;
  padding-bottom: 2px;
  align-items: center;
}

.multiselect-tags-margin {
  margin-top: 0.185rem;
  margin-bottom: 0.185rem;
}

.multiselect-tag {
  display: flex;
  margin-top: 0.175rem;
  margin-bottom: 0.175rem;
  margin-right: 0.35rem;
  padding: 0.125rem 0 0.125rem 0.5rem;
  white-space: pre-wrap;
  align-items: center;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 0.5rem;
  color: var(--color-neutral-white);
  background: var(--color-accent-normal);
}

.multiselect-tag-remove {
  display: flex;
  margin: 0 0.35rem 0 0.25rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.multiselect-tag-remove-icon {
  background-color: var(--color-neutral-white);
  display: inline-block;
  height: 0.75rem;
  width: 0.75rem;
  -webkit-mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m207.6 256 107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m207.6 256 107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'/%3E%3C/svg%3E");
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.multiselect-tags-search-wrapper {
  display: inline-block;
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
  margin: 0 0.25rem;
  position: relative;
}

.multiselect-tags-search-copy {
  display: inline-block;
  height: 1px;
  visibility: hidden;
  white-space: pre-wrap;
  width: 100%;
}

.multiselect-tags-search {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 0;
  padding: 0 !important;
  width: 100%;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.multiselect-tags-search:focus {
  box-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width))
    var(--tw-ring-color) !important;
}

.multiselect-clear {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 0.5rem;
  cursor: pointer;
  outline: none;
}

.multiselect-clear-icon {
  display: inline-block;
  background-color: var(--color-text-disabled);
  -webkit-mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m207.6 256 107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m207.6 256 107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'/%3E%3C/svg%3E");
}

.multiselect-clear-icon {
  height: 1.125rem;
  width: 0.625rem;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.multiselect-dropdown {
  position: absolute;
  display: flex;
  flex-direction: column;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 10rem;
  margin-top: 0;
  z-index: 30;
  transform: translateY(100%);
  overflow-y: auto;
  background: var(--color-neutral-white);
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  outline: none;
  -webkit-overflow-scrolling: touch;
}

.multiselect-dropdown.is-hidden {
  display: none;
}

.multiselect-options {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.multiselect-option {
  display: flex;
  align-items: center;
  padding: 0.425rem 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text-body);
}

.multiselect-option.is-pointed {
  color: var(--color-accent-accent);
  background: var(--color-neutral-lightest);
}

.multiselect-option.is-selected {
  color: var(--color-accent-accent);
  background: var(--color-accent-light);
}

.multiselect-option.is-disabled {
  color: var(--color-text-disabled);
  background: var(--color-neutral-lightest);
  cursor: not-allowed;
}

.multiselect-option.is-selected.is-pointed {
  color: var(--color-accent-accent);
  background: var(--color-neutral-lightest);
}

.multiselect-option.is-selected.is-disabled {
  color: var(--color-text-disabled);
  background: var(--color-neutral-lightest);
}

.multiselect-no-options,
.multiselect-no-results {
  display: flex;
  align-items: center;
  padding: 0.425rem 0.75rem;
  font-size: 1rem;
  cursor: auto;
  color: var(--color-text-body);
}

.multiselect-assistive-text {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.multiselect-border {
  border: 1px solid rgba(0, 58, 82, 0.6);
}

.multiselect-dropdown-border {
  border: 1px solid rgba(0, 58, 82, 0.6);
  border-top: none;
  width: calc(100% + 2px);
  margin: 0 -0.05rem;
}
</style>
