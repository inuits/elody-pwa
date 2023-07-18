<template>
  <div class="text-sm pl-4">
    <p class="text-text-light w-full">{{ label }}</p>
    <div v-if="Array.isArray(readableValue)">
      <div v-for="item in readableValue" :key="item">
        <p v-if="!stringIsUrl(item)">{{ item }}</p>
        <a v-else class="underline" target="_blank" :href="item">{{ item }}</a>
      </div>
    </div>
    <div v-else>
      <a
        v-if="stringIsUrl(readableValue)"
        class="underline"
        target="_blank"
        :href="readableValue"
        >{{ readableValue }}</a
      >
      <p v-else>{{ readableValue || "-" }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Unit } from "@/generated-types/queries";
import { convertUnitToReadbleFormat, stringIsUrl } from "@/helpers";
import { computed } from "vue";

const props = defineProps<{
  label?: string;
  value?: any;
  unit?: string;
}>();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});
</script>
