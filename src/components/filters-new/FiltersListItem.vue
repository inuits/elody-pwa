<template>
  <div
    v-show="!filter.advancedFilter.hidden"
    class="flex items-center justify-between px-6 py-4 border-t-2 cursor-pointer select-none"
    :class="
      filter.isActive
        ? 'bg-accent-normal border-accent-normal'
        : 'border-neutral-light'
    "
    @click="isOpen = !isOpen"
  >
    <span class="text-text-body text-lg">
      {{ filter.advancedFilter.label }}
    </span>
    <unicon :name="icon" height="20" fill="text-text-body" />
  </div>
  <div v-show="isOpen" class="bg-neutral-light p-6">
    <BaseInputTextNumber v-model="value" input-style="default" />
  </div>
</template>
<script lang="ts" setup>
import type { FilterListItem } from "@/components/filters-new/FiltersBase.vue";
import BaseInputTextNumber from "@/components/base/BaseInputTextNumber.vue";
import { computed, ref, watch } from "vue";
import { Unicons } from "../../types";

const props = defineProps<{
  filter: FilterListItem;
}>();

const isOpen = ref<boolean>(false);
const value = ref<string>("");

const icon = computed<string>(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name
);

watch(value, () => (props.filter.isActive = !!value.value));
</script>
