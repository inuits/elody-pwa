<template>
  <div
    v-if="Array.isArray(determineInputType) && determineInputType.length === 2"
  >
    <BaseInputTextNumberDatetime
      class="mt-2"
      v-model="inputMax"
      input-style="default"
      :type="determineInputType[0]"
      :placeholder="determinePlaceholder"
    />
    <BaseInputTextNumberDatetime
      v-if="filter.advancedFilter.showTimeForDateFilter"
      v-model="inputTimeMax"
      input-style="default"
      :type="determineInputType[1]"
      :placeholder="determinePlaceholder"
    />
  </div>
  <div v-else>
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
import type { AdvancedFilterInput } from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";

const props = defineProps<{ filter: FilterListItem }>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean,
  ): void;
}>();

const { inputMax, inputTimeMax, determineInputType, determinePlaceholder } =
  useMinMaxAdvancedFilter(props.filter, emit);
</script>
