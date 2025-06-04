import type { Elements } from "@/components/entityElements/EntityElement.vue";
import type { Column, ColumnSizes } from "@/generated-types/queries";
import { convertSizeToTailwind } from "@/helpers";
import { ref } from "vue";

let defaultColumnConfig: Record<string, Column[]> = {};
const currentColumnConfig = ref<Record<string, Column[]> | {}>({});

const useColumnResizeHelper = () => {
  const setInitialColumns = (entityId: string, columns: Column[]) => {
    defaultColumnConfig[entityId] = JSON.parse(JSON.stringify(columns));
    currentColumnConfig.value[entityId] = columns;
  };

  const setColumnSize = (
    entityId: string,
    column: Column,
    newSize: ColumnSizes,
  ): string | void => {
    try {
      const foundColumn = currentColumnConfig.value[entityId].find(
        (columnConfig: Column) => columnConfig == column,
      );
      if (!foundColumn) {
        throw Error(
          `Column does not exist in current config for entity with id ${entityId}`,
        );
      }
      foundColumn.size = newSize;
      return convertSizeToTailwind(newSize);
    } catch (e) {
      console.log(e);
    }
  };

  const setColumnSizes = (
    entityId: string,
    sizeList: ColumnSizes[],
  ): Column[] | void => {
    try {
      if (sizeList.length != currentColumnConfig.value.length) {
        throw Error("Not all columns received sizes");
      }
      sizeList.forEach((size: ColumnSizes, index: number) => {
        currentColumnConfig.value[entityId][index].size = size;
      });
      return currentColumnConfig.value;
    } catch (e) {
      console.log(e);
    }
  };

  const getColumnSize = (entityId: string, column: Column): string | void => {
    try {
      const foundColumn = currentColumnConfig.value[entityId].find(
        (columnConfig: Column) => columnConfig == column,
      );
      if (!foundColumn) {
        throw Error(
          `Column does not exist in current config for entity with id ${entityId}`,
        );
      }
      return convertSizeToTailwind(foundColumn.size);
    } catch (e) {
      console.log(e);
    }
  };

  const resetToDefaultSizes = (entityId: string): Column[] => {
    currentColumnConfig.value[entityId].forEach(
      (column: Column, index: number) => {
        column.size = defaultColumnConfig[entityId][index].size;
      },
    );
    return currentColumnConfig.value;
  };

  return {
    setInitialColumns,
    setColumnSize,
    setColumnSizes,
    getColumnSize,
    resetToDefaultSizes,
    defaultColumnConfig,
    currentColumnConfig,
  };
};

const useEntityElementCollapseHelper = () => {
  const getElementByLabel = (
    entityId: string, elementLabel: string,
  ): { column: Column | undefined; element: Elements | undefined } => {
    try {
      let toggleElement: Elements | undefined = undefined;
      let toggleElementColumn: Column | undefined = undefined;

      currentColumnConfig.value[entityId].forEach((col: Column) => {
        const elements: { [key: string]: any } = col.elements;
        const columnElements = Object.getOwnPropertyNames(col.elements);
        columnElements.forEach((el: string) => {
          const element = elements[el];
          if (element.label === elementLabel) {
            toggleElementColumn = col;
            toggleElement = element;
          }
        });
      });

      if (!toggleElement || !toggleElementColumn) {
        throw Error("Element to toggle could not be found");
      }

      return { column: toggleElementColumn, element: toggleElement };
    } catch (e) {
      console.log(e);
      return { column: undefined, element: undefined };
    }
  };

  const toggleElementCollapse = (
    entityId: string,
    elementLabel: string,
    collapse: undefined | boolean = undefined,
    isPreviewElement: boolean | undefined = undefined,
  ) => {
    if (isPreviewElement) return;
    const { element, column } = getElementByLabel(entityId, elementLabel);
    if (element && column) {
      element.isCollapsed =
        collapse === undefined ? !element.isCollapsed : collapse;
    }
  };

  return { toggleElementCollapse };
};

export { useColumnResizeHelper, useEntityElementCollapseHelper };
