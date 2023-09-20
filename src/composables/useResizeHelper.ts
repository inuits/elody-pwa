import type { Elements } from "@/components/entityElements/EntityElement.vue";
import type { Column, ColumnSizes } from "@/generated-types/queries";
import { convertSizeToTailwind } from "@/helpers";
import { ref } from "vue";

let defaultColumnConfig: Column[] = [];
const currentColumnConfig = ref<Column[] | []>([]);

const useColumnResizeHelper = () => {
  const setInitialColumns = (columns: Column[]) => {
    defaultColumnConfig = JSON.parse(JSON.stringify(columns));
    currentColumnConfig.value = columns;
  };

  const setColumnSize = (
    column: Column,
    newSize: ColumnSizes
  ): string | void => {
    try {
      const foundColumn = currentColumnConfig.value.find(
        (columnConfig: Column) => columnConfig == column
      );
      if (!foundColumn) {
        throw Error("Column does not exist in current config");
      }
      foundColumn.size = newSize;
      return convertSizeToTailwind(newSize);
    } catch (e) {
      console.log(e);
    }
  };

  const setColumnSizes = (sizeList: ColumnSizes[]): Column[] | void => {
    try {
      if (sizeList.length != currentColumnConfig.value.length) {
        throw Error("Not all columns received sizes");
      }
      sizeList.forEach((size: ColumnSizes, index: number) => {
        currentColumnConfig.value[index].size = size;
      });
      return currentColumnConfig.value;
    } catch (e) {
      console.log(e);
    }
  };

  const getColumnSize = (column: Column): string | void => {
    try {
      const foundColumn = currentColumnConfig.value.find(
        (columnConfig: Column) => columnConfig == column
      );
      if (!foundColumn) {
        throw Error("Column does not exist or is out of date");
      }
      return convertSizeToTailwind(foundColumn.size);
    } catch (e) {
      console.log(e);
    }
  };

  const resetToDefaultSizes = (): Column[] => {
    currentColumnConfig.value.forEach((column: Column, index: number) => {
      column.size = defaultColumnConfig[index].size;
    });
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
    elementLabel: string
  ): { column: Column | undefined; element: Elements | undefined } => {
    try {
      let toggleElement: Elements | undefined = undefined;
      let toggleElementColumn: Column | undefined = undefined;

      currentColumnConfig.value.forEach((col: Column) => {
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

  const toggleElementCollapse = (elementLabel: string) => {
    const { element, column } = getElementByLabel(elementLabel);
    if (element && column) {
      element.isCollapsed = !element.isCollapsed;
    }
  };

  return { toggleElementCollapse };
};

export { useColumnResizeHelper, useEntityElementCollapseHelper };
