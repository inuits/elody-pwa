<template>
  <div v-if="options">
    <ul
      v-for="(option, index) in options.FilterOptions"
      :key="option && option.label ? `${option.label}-${index}` : 'no-key'"
    >
      <li
        v-if="
          option &&
          option.label &&
          (acceptedEntityTypes.length == 0 || filterkey !== 'type')
        "
      >
        <input
          :id="option.label"
          v-model="inputFieldMulti"
          type="checkbox"
          :name="option.label"
          :value="option.value"
        />
        <label
          :for="option.label"
          class="ml-2 align-center p-10px cursor-pointer display-inline-block"
        >
          {{ option.label.charAt(0).toUpperCase() + option.label.slice(1) }}
        </label>
      </li>
      <li
        v-if="
          option &&
          option.label &&
          option.value &&
          acceptedEntityTypes.includes(option.value) &&
          filterkey == 'type'
        "
      >
        <input
          :id="option.value"
          type="checkbox"
          :name="option.label"
          checked
          disabled
        />
        <label
          :for="option.label"
          class="ml-2 align-center p-10px cursor-pointer display-inline-block"
        >
          {{
            option.label.charAt(0).toUpperCase() + option.label.slice(1)
          }}</label
        >
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import type {
  AdvancedFilter,
  GetFilterOptionsDocument,
} from "@/generated-types/queries";
import {
  defaultReturnMultiSelectObject,
  type FilterInList,
} from "@/composables/useFilterHelper";

const props = defineProps<{
  listValue: {
    type: FilterInList;
    required: false;
    default: undefined;
  };
  filter: {
    type: AdvancedFilter;
    required: true;
  };
  acceptedEntityTypes: {
    type: String[];
    required: false;
  };
}>();

const emit = defineEmits<{
  (event: "update:value", defaultMinMaxObject: FilterInList): void;
}>();

let options: { FilterOptions: FilterOptions } = {
  FilterOptions: props.filter?.options,
};
const andOr = ref<"and" | "or">("and");
const isAnd = computed<boolean>({
  get() {
    return andOr.value === "and";
  },
  set(newValue: any) {
    if (newValue) {
      andOr.value = "and";
    } else {
      andOr.value = "or";
    }
    props.listValue &&
      props.listValue?.input.multiSelectInput &&
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: props.listValue.input.multiSelectInput.value,
          AndOrValue: newValue,
        })
      );
  },
});

const inputFieldMulti = ref<any[]>([]);

watch(
  () => props.listValue,
  () => {
    if (props.listValue && props.listValue.input.multiSelectInput) {
      inputFieldMulti.value = props.listValue.input.multiSelectInput.value
        ? props.listValue.input.multiSelectInput.value
        : [];
    }
  },
  { deep: true }
);

watch(
  () => inputFieldMulti.value,
  (newVal: any, oldVal: any) => {
    if (newVal !== oldVal) {
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: inputFieldMulti.value,
          AndOrValue: isAnd.value,
        })
      );
    }
  }
);

if (props.acceptedEntityTypes.length > 0 && props.filter?.key === "type") {
  emit(
    "update:value",
    defaultReturnMultiSelectObject("type", {
      value: props.acceptedEntityTypes,
      AndOrValue: isAnd.value,
    })
  );
}
</script>

<style></style>
