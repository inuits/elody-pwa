<template>
  <div v-if="options">
    <ul
      v-for="(option, index) in clickedFilter.options"
      :key="option && option.label ? `${option.label}-${index}` : 'no-key'"
    >
      <li
        v-if="
          option &&
          option.label &&
          (acceptedEntityTypes?.length == 0 || filter.key !== 'type')
        "
      >
        <input
          :id="option.label"
          v-model="inputFieldMulti"
          type="checkbox"
          :name="option.label"
          :value="option.value"
          class="w-4 h-4 ml-3 rounded text-accent-normal checked:text-accent-normal"
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
          acceptedEntityTypes?.includes(option.value) &&
          filter.key == 'type'
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
import type { AdvancedFilter } from "@/generated-types/queries";
import {
  defaultReturnMultiSelectObject,
  type FilterInList,
  type FilterOptions,
} from "@/composables/useFilterHelper";
import { useFilterSideBarHelperNew } from "@/composables/useFilterSideBarHelperNew";

const props = defineProps<{
  value?: FilterInList;
  filter: AdvancedFilter;
  acceptedEntityTypes?: String[];
}>();

const { clickedFilter } = useFilterSideBarHelperNew();

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
    props.value &&
      props.value?.input.numberInput &&
      emit(
        "update:value",
        defaultReturnMultiSelectObject(props.filter?.key, {
          value: props.value.input.numberInput.value,
          AndOrValue: newValue,
        })
      );
  },
});

const inputFieldMulti = ref<any[]>([]);

watch(
  () => props.value,
  () => {
    if (props.value && props.value.input.numberInput) {
      inputFieldMulti.value = props.value.input.numberInput.value
        ? props.value.input.numberInput.value
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
      if (clickedFilter.value.key === "museum") {
        emit(
          "update:value",
          defaultReturnMultiSelectObject("type", {
            value: clickedFilter.value.key,
            AndOrValue: isAnd.value,
          })
        );
      }
    }
  }
);

if (props.acceptedEntityTypes?.length > 0 && props.filter?.key === "type") {
  emit(
    "update:value",
    defaultReturnMultiSelectObject("type", {
      value: props.acceptedEntityTypes,
      AndOrValue: isAnd.value,
    })
  );
}
</script>

<style>
.test:checked {
  color: white;
}
</style>
