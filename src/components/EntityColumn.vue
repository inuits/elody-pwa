<template>
  <div
    :class="[
      { 'w-full flex mt-5 overflow-y-scroll': !isPreviewElement },
      { 'mb-20': useEditHelper.isEdit && !isPreviewElement },
    ]"
  >
    <div
      v-for="(column, index) in currentColumnConfig[id]"
      :key="index"
      :class="[
        'h-full',
        convertSizeToTailwind(column.size),
        { 'px-5': !isPreviewElement },
      ]"
    >
      <entity-element
        :elements="column.elements"
        :identifiers="identifiers"
        :id="id"
        :entity-type="entityType"
      >
      </entity-element>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, inject, reactive, isReactive, watch } from "vue";
import type {
  ColumnList,
  Column,
  Entitytyping,
} from "@/generated-types/queries";
import EntityElement from "./entityElements/EntityElement.vue";
import { convertSizeToTailwind } from "@/helpers";
import { useColumnResizeHelper } from "../composables/useResizeHelper";
import { useEditMode } from "@/composables/useEdit";

const props = defineProps<{
  columnList: ColumnList;
  identifiers: string[];
  id: string;
  entityType: Entitytyping;
}>();

const { setInitialColumns, currentColumnConfig } = useColumnResizeHelper();
const useEditHelper = useEditMode(props.id);
const isPreviewElement: boolean = inject("IsPreviewElement", false);

const columns = computed<Column[]>(() => {
  const returnArray: Column[] = [];

  Object.values(props.columnList).forEach((value) => {
    if (typeof value !== "string") {
      if (isReactive(value)) {
        returnArray.push(value);
      } else {
        const clonedValue = JSON.parse(JSON.stringify(value));
        returnArray.push(reactive(clonedValue));
      }
    }
  });

  return returnArray;
});

watch(
  () => columns.value,
  () => {
    if (columns.value) setInitialColumns(props.id, columns.value);
  },
  { immediate: true },
);
</script>
