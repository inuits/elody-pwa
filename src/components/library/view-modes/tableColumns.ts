export type TableColumn = { hasFormatter: boolean };

export const tableColumnsTemplate = (
  columns: TableColumn[],
  pinnedCount: number,
): string =>
  columns
    .map((_, idx) =>
      idx < pinnedCount - 1
        ? "var(--table-col-badge)"
        : idx === pinnedCount - 1
          ? "minmax(var(--table-col-title), 1fr)"
          : "minmax(var(--table-col), 1fr)",
    )
    .join(" ");

export const tablePinnedCount = (columns: TableColumn[]): number =>
  columns.findIndex((column) => !column.hasFormatter) + 1;

export const tableColumnClass = (idx: number, pinnedCount: number) => {
  const isFirstColumn = idx === 0;
  const isPinned = idx < pinnedCount;
  const isLastPinned = idx === pinnedCount - 1;

  return [
    "flex flex-col justify-center min-w-0 px-(--table-col-pad-x) break-words",
    isFirstColumn ? "col-primary" : "col-secondary",
    { "col-pinned sticky z-1 bg-inherit": isPinned },
    { "border-r border-border-faint": isLastPinned },
  ];
};

export const tableColumnStyle = (idx: number, pinnedCount: number) =>
  idx < pinnedCount ? { left: `calc(${idx} * var(--table-col-badge))` } : {};
