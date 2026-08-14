<template>
  <div class="flex flex-row justify-between gap-4">
    <div class="w-1/2">
      <span class="text-sm text-text-body">minimum</span>
      <BaseInputTextNumberDatetime
        v-model="inputMin"
        input-style="default"
        :type="determineInputType"
        :placeholder="determinePlaceholder"
      />
    </div>
    <div class="w-1/2">
      <span class="text-sm text-text-body">maximum</span>
      <BaseInputTextNumberDatetime
        v-model="inputMax"
        input-style="default"
        :type="determineInputType"
        :placeholder="determinePlaceholder"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";

const props = defineProps<{ filter: FilterListItem }>();
const emit = defineEmits<{
  (event: "updateValue", newValue: any, force: boolean): void;
}>();

const {
  inputMin,
  inputMax,
  determineInputType,
  determinePlaceholder,
} = useMinMaxAdvancedFilter(props.filter, emit);

const reset = () => {
  inputMin.value = "";
  inputMax.value = "";
};

defineExpose({
  reset,
});
</script>
