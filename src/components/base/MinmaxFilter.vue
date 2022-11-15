<template>
  <div class="flex md:justify-around">
    <MinMaxField
      id="inputBox"
      v-model="inputFieldMin"
      :debounce="true"
      :placeholder="$t('filter.min')"
      :bg-color="'neutral-20'"
      :label="$t('filter.min')"
    />
    <MinMaxField
      v-model="inputFieldMax"
      :debounce="true"
      :placeholder="$t('filter.max')"
      :bg-color="'neutral-20'"
      :label="$t('filter.max')"
      :min="inputFieldMin + 1"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import MinMaxField from "@/components/base/MinMaxField.vue";
import { defaultReturnMinMaxObject } from "@/composables/useFilterHelper";
import type { FilterInList } from "@/composables/useFilterHelper";
import type { AdvancedFilter } from '@/queries';

export default defineComponent({
  name: "MinmaxFilter",
  components: {
    MinMaxField,
  },
  props: {
    minmaxValue: {
      type: Object as PropType<FilterInList>,
      required: false,
      default: undefined,
    },
    filter: {
      type: Object as PropType<AdvancedFilter>,
      required: true,
    },
    isRelation: {
      type: Object as PropType<Boolean | null>,
      required: false,
      default: false,
    },
  }, 
  emits: ["update:minmaxValue"],
  setup(props, { emit }) {
    emit("update:minmaxValue", defaultReturnMinMaxObject(props.filter?.key));

    const inputFieldMin = computed<number | undefined>({
      get() {
        return props.minmaxValue &&
          props.minmaxValue.input.minMaxInput &&
          props.minmaxValue.input.minMaxInput.min
          ? props.minmaxValue.input.minMaxInput.min
          : undefined;
      },
      set(value) {
        emit(
          "update:minmaxValue",
          defaultReturnMinMaxObject(props.filter?.key, {
            min: value,
            max: inputFieldMax.value,
            isRelation: props.isRelation,
          })
        );
      },
    });

    const inputFieldMax = computed<number | undefined>({
      get() {
        return props.minmaxValue &&
          props.minmaxValue.input.minMaxInput &&
          props.minmaxValue.input.minMaxInput.max
          ? props.minmaxValue.input.minMaxInput.max
          : undefined;
      },
      set(value) {
        emit(
          "update:minmaxValue",
          defaultReturnMinMaxObject(props.filter?.key, {
            min: inputFieldMin.value,
            max: value,
            isRelation: props.isRelation,
          })
        );
      },
    });

    return { inputFieldMin, inputFieldMax };
  },
});
</script>

/* function isInteger(value: MinMaxInput|undefined) { throw new Error('Function
not implemented.'); } */
