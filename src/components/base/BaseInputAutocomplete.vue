<template>
  <Multiselect
    data-cy="multiselect"
    v-if="inputValue"
    v-model="inputValue"
    mode="tags"
    :options="options"
    :searchable="searchable"
    :show-options="searchable"
    :close-on-select="true"
    :classes="classes"
    :caret="!disabled"
    :placeholder="placeholder"
    :append-to="someModalIsOpened ? '.base-modal--opened' : 'body'"
    :loading="loading"
    :disabled="disabled"
    :noOptionsText="noOptionsText"
    :object="true"
    :create-option="canCreateOption"
    :search-filter="searchFilter"
    label="label"
    valueProp="value"
    @search-change="
      (value: string) => {
        searchValue = value;
        emit('searchChange', value);
      }
    "
    :on-create="handleTagCreate"
  >
    <template v-slot:tag="{ option, handleTagRemove, disabled }">
      <div
        class="cursor-default"
        :class="[
          classes.tag,
          { 'pr-2': !isEdit },
          {
            'hover:!bg-background-normal hover:!text-accent-accent transition-colors duration-300 !cursor-pointer':
              !isEdit && relationType,
          },
        ]"
        @click.stop="() => emit('handleTagClick', option)"
      >
        {{ option.label }}
        <span
          v-if="!disabled"
          class="multiselect-tag-remove !cursor-pointer"
          @click.prevent.stop="handleTagRemove(option, $event)"
        >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
      </div>
    </template>
  </Multiselect>
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import Multiselect from "@vueform/multiselect";
import useEntitySingle from "@/composables/useEntitySingle";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useEditMode } from "@/composables/useEdit";

type AutocompleteStyle = "default" | "defaultWithBorder" | "readOnly";

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption[] | undefined;
    options: DropdownOption[];
    autocompleteStyle: AutocompleteStyle;
    relationType?: string;
    selectType?: "multi" | "single";
    placeholder?: string;
    disabled?: boolean;
    relation?: boolean;
    loading?: boolean;
    noOptionsText?: string;
    canCreateOption?: boolean;
    searchFilter?: () => any;
  }>(),
  {
    selectType: "multi",
    placeholder: "",
    disabled: false,
    relation: false,
    loading: false,
    canCreateOption: false,
    searchFilter: undefined,
  },
);

const emit = defineEmits<{
  (event: "addOption", option: DropdownOption[]): void;
  (event: "handleTagClick", option: DropdownOption[]): void;
  (event: "searchChange", value: string): void;
  (event: "update:modelValue", modelValue: DropdownOption[] | undefined): void;
}>();

const { isEdit } = useEditMode(useEntitySingle().getEntityUuid());
const { someModalIsOpened } = useBaseModal();
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

  const defaultContainerStyles = "multiselect rounded-lg items-stretch";
  classes.value["container"] = `${defaultContainerStyles} border-none`;
  classes.value["containerActive"] =
    "outline-1 outline-accent-normal outline-offset-0";
  classes.value["tagsSearch"] =
    "multiselect-tags-search !border-none focus:ring-0 p-0";
  classes.value["tag"] = "multiselect-tag !bg-accent-accent !opacity-100";
  classes.value["dropdown"] = "multiselect-dropdown -bottom-px";

  if (props.autocompleteStyle === "defaultWithBorder") {
    classes.value["container"] =
      `${defaultContainerStyles} !border-[rgba(0,58,82,0.6)] !rounded-lg`;
  }

  if (props.autocompleteStyle === "readOnly") {
    classes.value["container"] = "multiselect border-none !bg-white";
    classes.value["tags"] =
      "grow shrink flex flex-wrap items-center mt-1 min-w-0 rtl:pl-0 rtl:pr-2";
  }
};

onBeforeMount(() => setClasses());

watch(
  () => [inputValue.value, props.options],
  () => setClasses(),
);

const handleTagCreate = async (option: any) => {
  emit("addOption", option);
  return false;
};
</script>

<style>
@reference "@/assets/main.css";
@import "@/assets/multiselect-custom-theme.css";

.multiselect-search {
  border: none;
}

.multiselect-search:focus {
  border: none;
  border-color: transparent;
  outline: none;
}
</style>
