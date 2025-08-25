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
    :locale="locale"
    :fields="panelsFields"
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
          @toggle-element-collapse="(entityId, elementLabel) => toggleElementCollapse(entityId, elementLabel, undefined, isPreviewElement)"
          @resize-column="resizeColumn"
        >
        </entity-element>
      </div>
    </div>
  </entity-form>
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  reactive,
  isReactive,
  watch,
  ref,
  onMounted,
} from "vue";
import {
  type ColumnList,
  type Column,
  type Entitytyping,
  type IntialValues,
  type BaseEntity,
  type PanelMetaData,
  type WindowElementPanel,
  ColumnSizes
} from "@/generated-types/queries";
import EntityElement from "./entityElements/EntityElement.vue";
import {
  convertSizeToTailwind,
  determineDefaultIntialValues,
  findPanelMetadata,
} from "@/helpers";
import {
  useColumnResizeHelper,
  useEntityElementCollapseHelper
} from "@/composables/useResizeHelper";
import { useEditMode } from "@/composables/useEdit";
import EntityForm from "@/components/EntityForm.vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useI18n } from "vue-i18n";

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

const {
  setInitialColumns,
  currentColumnConfig,
  setColumnSizes,
  resetToDefaultSizes
} = useColumnResizeHelper();
const {
  toggleElementCollapse
} = useEntityElementCollapseHelper(currentColumnConfig);
const useEditHelper = useEditMode(props.entity.id);
const { locale } = useI18n();

const intialValues = ref<IntialValues | "no-values">("no-values");
const relationValues = ref<{ [key: string]: object } | "no-values">(
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

const panelsFields = computed<Record<string, PanelMetaData>>(() => {
  const panelMetadataArray = getPanelMetadataFromViewData(columns.value);
  const metadataMap: Record<string, PanelMetaData> = {};

  panelMetadataArray.forEach((panel) => {
    if (panel.key) {
      metadataMap[panel.key] = panel;
    }
  });

  return metadataMap;
});

const getPanelMetadataFromViewData = (viewData: any[]): PanelMetaData[] => {
  return viewData.flatMap((column) => {
    const windowElementPanels = getWindowElementPanels(column.elements || {});

    return [
      ...windowElementPanels.flatMap((panel) => findPanelMetadata(panel)),
      ...findPanelMetadata(column),
    ];
  });
};

const getWindowElementPanels = (
  elements: Record<string, any>,
): WindowElementPanel[] => {
  const panels: WindowElementPanel[] = [];

  Object.values(elements).forEach((value) => {
    if (
      typeof value === "object" &&
      value?.__typename === "WindowElementPanel"
    ) {
      panels.push(value);
    }
  });

  return panels;
};

const resizeColumn = (toggled: boolean) => {
  if (toggled) {
    setColumnSizes(props.entity.id, [ColumnSizes.Fifty, ColumnSizes.Fifty]);
  } else {
    resetToDefaultSizes(props.entity.id);
  }
};

watch(
  () => columns.value,
  () => {
    if (columns.value) setInitialColumns(props.entity.id, columns.value);
  },
  { immediate: true },
);

onBeforeRouteUpdate(async () => {
  intialValues.value = "no-values";
  relationValues.value = "no-values";
});

onMounted(() => {
  intialValues.value = determineDefaultIntialValues(
    props.entity.intialValues,
    props.entity.entityView,
  );
  relationValues.value = props.entity.relationValues;
});
</script>
