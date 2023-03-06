<template>
  <div class="w-full flex overflow-y-scroll">
    <div
      v-for="(column, index) in columns"
      :key="index"
      :class="'h-full p-5 ' + convertSizeToTailwind(column.size)"
    >
      <entity-element :elements="column.elements"></entity-element>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import type { ColumnList, Column } from "@/generated-types/queries";
import EntityElement from "./EntityElement.vue";
import { convertSizeToTailwind } from "@/helpers";

const props = defineProps<{
  columnList: ColumnList;
}>();

const columns = computed<Column[]>(() => {
  const returnArray: Column[] = [];

  Object.values(props.columnList).forEach((value) => {
    if (typeof value !== "string") {
      returnArray.push(value);
    }
  });

  return returnArray;
});
</script>
