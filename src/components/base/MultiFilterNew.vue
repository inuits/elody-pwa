<template>
  <div>
    <div>
      <Multiselect
        v-if="isMulti"
        v-model="inputFieldMulti"
        mode="tags"
        :searchable="true"
        :close-on-select="false"
        :options="result?.FilterOptions"
        :label="$t('filter.label')"
        track-by="label"
        value-prop="label"
        :placeholder="$t('filter.choose')"
        :no-results-text="$t('filter.not-with-that-name')"
      />
    </div>
    <div>
      <InputField
        v-if="!isMulti"
        v-model="inputField"
        :debounce="true"
        :placeholder="$t('filter.fuzzy')"
        :bg-color="'neutral-20'"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  AdvancedFilter,
  FilterInList,
} from "@/composables/useFilterHelper";
import { computed, ref } from "vue";
import {
  defaultReturnMultiSelectObject,
  defaultReturnTextObject,
} from "../../composables/useFilterHelper";
import type { Maybe } from "@/generated-types/queries";
const props = defineProps<{
  multiSelectValue: {
    type: FilterInList;
    required: false;
    default: undefined;
  };
  filter: {
    type: AdvancedFilter;
    required: true;
  };
}>();

const emit = defineEmits<{
  (event: "update:value", initialFilters: FilterInList): void;
}>();
const andOr = ref<"and" | "or">("and");
const isAnd = computed<boolean>({
  get() {
    return andOr.value === "and";
  },
  set(newValue) {
    if (newValue) {
      andOr.value = "and";
    } else {
      andOr.value = "or";
    }
    props.multiSelectValue &&
      props.multiSelectValue?.input.multiSelectInput &&
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: props.multiSelectValue?.input.multiSelectInput.value,
          AndOrValue: newValue,
        })
      );
  },
});
const multiOrFuzzy = ref<"multi" | "fuzzy">("multi");
const isMulti = computed<boolean>({
  get() {
    return multiOrFuzzy.value === "multi";
  },
  set(newValue) {
    if (newValue) {
      multiOrFuzzy.value = "multi";
    } else {
      multiOrFuzzy.value = "fuzzy";
    }
  },
});

const inputFieldMulti = computed<Maybe<Maybe<string>[]> | undefined>({
  get() {
    return props.multiSelectValue &&
      props.multiSelectValue?.input.multiSelectInput
      ? props.multiSelectValue.input.multiSelectInput.value
      : undefined;
  },
  set(value) {
    if (props.multiSelectValue) {
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: value,
          AndOrValue: isAnd.value,
        })
      );
    }
  },
});

const inputField = computed<string | undefined | null>({
  get() {
    return props.multiSelectValue && props.multiSelectValue.input.textInput
      ? props.multiSelectValue?.input.textInput.value
      : undefined;
  },
  set(value) {
    emit("update:value", defaultReturnTextObject(props.filter?.key, value));
  },
});

type FilterOptions = { label: string; value: string }[];

let result: { FilterOptions: FilterOptions } = {
  FilterOptions: props.filter?.options,
};
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
:root {
  --ms-tag-bg: #0052cc;
  --ms-ring-color: white;
}
</style>
