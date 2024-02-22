<template>
  <div :class="['w-full flex mt-5 overflow-y-scroll', { 'mb-20': isEdit }]">
    <div
      v-for="(column, index) in currentColumnConfig"
      :key="index"
      :class="['h-full p-5', convertSizeToTailwind(column.size)]"
    >
      <entity-element
        :elements="column.elements"
        :identifiers="identifiers"
        :uuid="uuid"
      >
      </entity-element>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, watch } from "vue";
import type { ColumnList, Column } from "@/generated-types/queries";
import EntityElement from "./entityElements/EntityElement.vue";
import { convertSizeToTailwind } from "@/helpers";
import { useColumnResizeHelper } from "../composables/useResizeHelper";
import { useEditMode } from "@/composables/useEdit";

const props = defineProps<{
  columnList: ColumnList;
  identifiers: string[];
  uuid: string;
}>();

const { setInitialColumns, currentColumnConfig } = useColumnResizeHelper();
const { isEdit } = useEditMode();

const columns = computed<Column[]>(() => {
  const returnArray: Column[] = [];

  Object.values(props.columnList).forEach((value) => {
    if (typeof value !== "string") {
      returnArray.push(value);
    }
  });

  return returnArray;
});

watch(
  () => columns.value,
  () => {
    if (columns.value) setInitialColumns(columns.value);
  },
  { immediate: true }
);
</script>
