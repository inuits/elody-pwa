<template>
  <div class="flex flex-row justify-between gap-4">
    <div class="w-1/2">
      <span class="text-sm text-text-body">minimum</span>
      <div
        v-if="
          Array.isArray(determineInputType) && determineInputType.length === 2
        "
      >
        <BaseInputTextNumberDatetime
          class="mb-2"
          v-model="inputMin"
          input-style="default"
          :type="determineInputType[0]"
          :placeholder="determinePlaceholder"
        />
        <BaseInputTextNumberDatetime
          v-if="filter.advancedFilter.showTimeForDateFilter"
          v-model="inputTimeMin"
          input-style="default"
          :type="determineInputType[1]"
          :placeholder="determinePlaceholder"
        />
      </div>
      <div v-else>
        <BaseInputTextNumberDatetime
          v-model="inputMin"
          input-style="default"
          :type="determineInputType"
          :placeholder="determinePlaceholder"
        />
      </div>
    </div>
    <div class="w-1/2">
      <span class="text-sm text-text-body">maximum</span>
      <div
        v-if="
          Array.isArray(determineInputType) && determineInputType.length === 2
        "
      >
        <BaseInputTextNumberDatetime
          class="mb-2"
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";
import type { AdvancedFilterInput } from "@/generated-types/queries";

const props = defineProps<{ filter: FilterListItem }>();
const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean,
  ): void;
}>();

const {
  inputMin,
  inputTimeMin,
  inputMax,
  inputTimeMax,
  determineInputType,
  determinePlaceholder,
} = useMinMaxAdvancedFilter(props.filter, emit);
</script>
