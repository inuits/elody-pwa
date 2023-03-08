import type { Column, ColumnSizes } from "@/generated-types/queries";
import { convertSizeToTailwind } from "@/helpers";
import { ref } from "vue";

const currentColumnConfig = ref<Column[] | []>([]);

const useColumnResizeHelper = () => {
  const setColumns = (columns: Column[]) => {
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

  return { setColumns, setColumnSize, getColumnSize, currentColumnConfig };
};

export default useColumnResizeHelper;
