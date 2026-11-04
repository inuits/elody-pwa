import type { ColumnList } from "@/generated-types/queries";

const fieldKey = (value: any): string | undefined => {
  if (value?.__typename === "PanelMetaData") return value.key;
  if (value?.__typename === "WysiwygElement") return value.metadataKey;
  return undefined;
};

const filterPanel = (panel: any, keys: Set<string>) => {
  let hasField = false;
  const filtered: Record<string, any> = {};
  for (const [alias, value] of Object.entries(panel)) {
    const key = fieldKey(value);
    if (key === undefined) filtered[alias] = value;
    else if (keys.has(key)) {
      filtered[alias] = value;
      hasField = true;
    }
  }
  return hasField ? filtered : null;
};

const filterWindowElement = (windowElement: any, keys: Set<string>) => {
  let hasPanel = false;
  const filtered: Record<string, any> = {};
  for (const [alias, value] of Object.entries(windowElement)) {
    if ((value as any)?.__typename !== "WindowElementPanel") {
      filtered[alias] = value;
      continue;
    }
    const panel = filterPanel(value, keys);
    if (!panel) continue;
    filtered[alias] = panel;
    hasPanel = true;
  }
  return hasPanel ? filtered : null;
};

const hasNoRelations = (
  element: any,
  relationValues: Record<string, unknown[]> | undefined,
) =>
  element.__typename === "EntityListElement" &&
  !!relationValues &&
  !!element.relationType &&
  !relationValues[element.relationType]?.length;

// Keeps only the window-element fields whose metadata key is in `keys` and
// entity lists that have relations; null when nothing is left to render.
export const filterColumnListByKeys = (
  columnList: ColumnList,
  keys: string[],
  relationValues?: Record<string, unknown[]>,
): ColumnList | null => {
  const keySet = new Set(keys);
  let hasElement = false;
  const elements: Record<string, any> = {};
  for (const [alias, value] of Object.entries(columnList.column.elements)) {
    if (!value || typeof value !== "object") {
      elements[alias] = value;
      continue;
    }
    if (hasNoRelations(value, relationValues)) continue;
    const element =
      (value as any).__typename === "WindowElement"
        ? filterWindowElement(value, keySet)
        : value;
    if (!element) continue;
    elements[alias] = element;
    hasElement = true;
  }
  if (!hasElement) return null;
  return {
    ...columnList,
    column: { ...columnList.column, elements: elements as any },
  };
};

export const pickColumnElements = (
  columnList: ColumnList,
  predicate: (element: any) => boolean,
): ColumnList | null => {
  const elements = Object.fromEntries(
    Object.entries(columnList.column.elements).filter(
      ([, value]) => !value || typeof value !== "object" || predicate(value),
    ),
  );
  const hasElement = Object.values(elements).some(
    (value) => value && typeof value === "object",
  );
  if (!hasElement) return null;
  return {
    ...columnList,
    column: { ...columnList.column, elements: elements as any },
  };
};
