<template>
  <Multiselect
    data-cy="multiselect"
    v-if="inputValue"
    v-model="inputValue"
    mode="tags"
    :options="safeOptions"
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
    :create-option="createOptionConfig.canCreateOption"
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
    <template
      v-if="createOptionConfig.createPromptTranslationKey"
      v-slot:option="{ option }"
    >
      <div v-if="!options?.some((o) => o.value === option.value)">
        {{ t(createOptionConfig.createPromptTranslationKey, [option.label]) }}
      </div>
      <div v-else>
        {{ option.label }}
      </div>
    </template>
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
        <div
          v-if="displayInputForTag"
          @click.stop
          @mousedown.stop
          @keydown.stop
        >
          <BaseInputTextNumberDatetime
            class="w-[115px] h-[26px] ml-2 py-[2px]"
            :model-value="getTagInputValue(option.value)"
            @update:model-value="setTagInputValue(option.value, $event as string)"
            input-style="default"
            type="text"
            :disabled="disabled"
          />
        </div>
        <span
          v-if="!disabled"
          class="multiselect-tag-remove !cursor-pointer"
          @click.prevent.stop="handleTagRemove(option, $event)"
        >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
      </div>
    </template>
    <template v-slot:afterlist>
      <div v-if="shouldShowTypingHint" class="multiselect-typing-hint">
        {{ t("autocomplete.find-more-options-placeholder") }}
      </div>
    </template>
  </Multiselect>
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import Multiselect from "@vueform/multiselect";
import useEntitySingle from "@/composables/useEntitySingle";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useEditMode } from "@/composables/useEdit";
import { useI18n } from "vue-i18n";

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
    createOptionConfig?: {
      canCreateOption: boolean;
      createPromptTranslationKey?: string;
    };
    searchFilter?: () => any;
    displayInputForTag?: boolean;
    initialTagInputValues?: Map<string | number, string>;
  }>(),
  {
    selectType: "multi",
    placeholder: "",
    disabled: false,
    relation: false,
    loading: false,
    createOptionConfig: { canCreateOption: false },
    searchFilter: undefined,
    displayInputForTag: false,
    initialTagInputValues: undefined,
  },
);

const emit = defineEmits<{
  (event: "addOption", option: DropdownOption[]): void;
  (event: "handleTagClick", option: DropdownOption[]): void;
  (event: "searchChange", value: string): void;
  (event: "update:modelValue", modelValue: DropdownOption[] | undefined): void;
  (
    event: "update:tagInputValues",
    values: Map<string | number, string>,
  ): void;
}>();

const { isEdit } = useEditMode(useEntitySingle().getEntityUuid());
const { someModalIsOpened } = useBaseModal();
const { t } = useI18n();
const classes = ref();
const searchValue = ref<string>();
const tagInputValues = ref<Map<string | number, string>>(new Map());

const getTagInputValue = (optionValue: string | number): string => {
  return tagInputValues.value.get(optionValue) ?? "";
};

const setTagInputValue = (optionValue: string | number, value: string) => {
  tagInputValues.value.set(optionValue, value);
  emit("update:tagInputValues", new Map(tagInputValues.value));
};

watch(
  () => props.initialTagInputValues,
  (initial) => {
    if (!initial) return;
    tagInputValues.value = new Map(initial);
  },
  { immediate: true },
);

const inputValue = computed<DropdownOption[] | undefined>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const safeOptions = computed(() => props.options?.map((o) => ({ ...o })) ?? []);

const searchable = computed<boolean>(() => {
  return (
    !inputValue.value ||
    inputValue.value[0]?.value === "" ||
    props.selectType === "multi" ||
    (props.selectType === "single" && inputValue.value.length < 1)
  );
});

const shouldShowTypingHint = computed(() => {
  const isReachedOptionsLimit = props.options && props.options.length >= 20;
  const isSearchValueEmpty = !searchValue.value?.trim();
  const hasSelectedValue = inputValue.value && inputValue.value.length > 0;
  return isReachedOptionsLimit && isSearchValueEmpty && hasSelectedValue;
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

watch(
  () => inputValue.value,
  (newOptions) => {
    if (!newOptions || !props.displayInputForTag) return;
    const currentValues = new Set(newOptions.map((o) => o.value));
    let didDelete = false;
    for (const key of tagInputValues.value.keys()) {
      if (!currentValues.has(key)) {
        tagInputValues.value.delete(key);
        didDelete = true;
      }
    }
    if (didDelete) {
      emit("update:tagInputValues", new Map(tagInputValues.value));
    }
  },
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
