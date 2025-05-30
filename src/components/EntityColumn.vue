<template>
  <entity-form
    v-if="intialValues != 'no-values' && relationValues != 'no-values'"
    :key="entity.id"
    :intial-values="intialValues"
    :relation-values="relationValues"
    :uuid="entity.uuid"
    :id="entity.id"
    :type="entityType"
    :delete-query-options="entity.deleteQueryOptions"
  >
    <div
      :class="[
        { 'w-full flex mt-5 overflow-y-auto': !isPreviewElement },
        { 'mb-20': useEditHelper.isEdit && !isPreviewElement },
      ]"
    >
      <div
        v-for="(column, index) in currentColumnConfig[entity.id]"
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
          :id="entity.id"
          :entity-type="entityType"
          :preview-label="previewLabel"
          @close-preview-component="emit('closePreviewComponent')"
        >
        </entity-element>
      </div>
    </div>
  </entity-form>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, isReactive, watch, ref, onMounted } from "vue";
import type {
  ColumnList,
  Column,
  Entitytyping,
  IntialValues,
  BaseEntity
} from "@/generated-types/queries";
import EntityElement from "./entityElements/EntityElement.vue";
import { convertSizeToTailwind, determineDefaultIntialValues } from "@/helpers";
import { useColumnResizeHelper } from "../composables/useResizeHelper";
import { useEditMode } from "@/composables/useEdit";
import EntityForm from "@/components/EntityForm.vue";
import { onBeforeRouteUpdate } from "vue-router";

const props = withDefaults(
  defineProps<{
    entity: BaseEntity;
    columnList: ColumnList;
    identifiers: string[];
    entityType: Entitytyping;
    previewLabel?: string;
  }>(),
  {
    previewLabel: undefined,
  },
);

const emit = defineEmits(["closePreviewComponent"]);
const isPreviewElement: boolean = inject("IsPreviewElement", false);
const { setInitialColumns, currentColumnConfig } = useColumnResizeHelper();
const useEditHelper = useEditMode(props.entity.id);

const intialValues = ref<IntialValues | "no-values">("no-values");
const relationValues = ref<{ [key: string]: Object } | "no-values">(
  "no-values",
);

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
    if (columns.value) setInitialColumns(props.entity.id, columns.value);
  },
  { immediate: true },
);

onBeforeRouteUpdate(async (to: any) => {
  intialValues.value = "no-values";
  relationValues.value = "no-values";
});

onMounted(() => {
  intialValues.value = determineDefaultIntialValues(
    props.entity.intialValues,
    props.entity.entityView,
  );
  relationValues.value = props.entity.relationValues;
})
</script>
