<template>
  <div>
    <BaseInputTextNumberDatetime
      v-model="inputMax"
      input-style="default"
      :type="determineInputType"
      :placeholder="determinePlaceholder"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";

const props = defineProps<{ filter: FilterListItem }>();

const emit = defineEmits<{
  (event: "updateValue", value: any, force: boolean): void;
}>();

const { inputMax, determineInputType, determinePlaceholder } =
  useMinMaxAdvancedFilter(props.filter, emit);

const reset = () => {
  inputMax.value = "";
};

defineExpose({
  reset,
});
</script>
