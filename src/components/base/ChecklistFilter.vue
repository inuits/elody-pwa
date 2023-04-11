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
<script lang="ts">
import { defaultReturnMultiSelectObject } from "@/composables/useFilterHelper";
import type { FilterInList } from "@/composables/useFilterHelper";
import {
  AdvancedFilter,
  GetFilterOptionsDocument,
} from "@/generated-types/queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import InputField from "./InputField.vue";

// import AndOrToggle from './AndOrToggle.vue';
export default defineComponent({
  name: "ChecklistFilter",
  // components: { AndOrToggle },
  props: {
    listValue: {
      type: Object as PropType<FilterInList>,
      required: false,
      default: undefined,
    },
    filter: {
      type: Object as PropType<AdvancedFilter>,
      required: true,
    },
    acceptedEntityTypes: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: false,
    },
  },
  emits: ["update:value"],
  setup(props, { emit }) {
    emit("update:value", defaultReturnMultiSelectObject(props.filter?.key));
    type FilterOptions = { label: string; value: string }[];

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
          props.listValue.input.multiSelectInput &&
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

    return { options, inputFieldMulti, isAnd };
  },
});
</script>
