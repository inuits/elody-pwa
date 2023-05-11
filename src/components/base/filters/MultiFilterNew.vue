<template>
  <div>
    <div>
      <Multiselect
        v-if="isMulti"
        v-model="inputFieldMulti"
        mode="tags"
        :searchable="true"
        :close-on-select="true"
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
import { computed, defineProps, ref, defineEmits } from "vue";
import Multiselect from "@vueform/multiselect";
import InputField from "@/components/base/InputField.vue";
import {
  type AdvancedFilter,
  defaultReturnMultiSelectObject,
  defaultReturnTextObject,
  type FilterInList,
  type FilterOptions,
} from "@/composables/useFilterHelper";

const props = defineProps<{
  value?: FilterInList;
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (event: "update:value", defaultMultiSelectObject: FilterInList): void;
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
    props.value &&
      props.value?.input.multiSelectInput &&
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: props.value?.input.multiSelectInput.value,
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
    return props.value && props.value?.input.multiSelectInput
      ? props.value?.input.multiSelectInput.value
      : undefined;
  },
  set(value) {
    emit(
      "update:value",
      defaultReturnMultiSelectObject(props.filter?.key, {
        value: value,
        AndOrValue: isAnd.value,
      })
    );
  },
});

const inputField = computed<string | undefined | null>({
  get() {
    return props.value && props.value?.input.textInput
      ? props.value?.input.textInput.value
      : undefined;
  },
  set(value) {
    emit("update:value", defaultReturnTextObject(props.filter?.key, value));
  },
});

let result: { FilterOptions: FilterOptions } = {
  FilterOptions: props.filter?.options,
};
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style>
:root {
  --ms-tag-bg: var(--color-accent-normal);
  --ms-ring-color: white;
}
</style>
