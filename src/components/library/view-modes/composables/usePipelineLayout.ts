// Pure left-to-right flow layout for the pipeline view mode.
//
// Positions are derived on every call from the nodes' connection metadata and
// their measured heights — nothing here is persisted, and nothing here touches
// Vue reactivity, so the algorithm is unit-testable on its own.

export type PipelineNodeInput = {
  id: string;
  height: number;
  sources: string[];
};

export type PipelineLayout = {
  positions: Record<string, { x: number; y: number; col: number }>;
  contentWidth: number;
  contentHeight: number;
};

export type PipelineLayoutOptions = {
  cardWidth?: number;
  columnGap?: number;
  rowGap?: number;
  padding?: number;
};

export const PIPELINE_CARD_WIDTH = 272;
export const PIPELINE_COLUMN_GAP = 112;
export const PIPELINE_ROW_GAP = 26;
export const PIPELINE_CANVAS_PADDING = 40;

export const layoutPipeline = (
  nodes: PipelineNodeInput[],
  opts: PipelineLayoutOptions = {},
): PipelineLayout => {
  const cardWidth = opts.cardWidth ?? PIPELINE_CARD_WIDTH;
  const columnGap = opts.columnGap ?? PIPELINE_COLUMN_GAP;
  const rowGap = opts.rowGap ?? PIPELINE_ROW_GAP;
  const padding = opts.padding ?? PIPELINE_CANVAS_PADDING;

  if (nodes.length === 0)
    return { positions: {}, contentWidth: 0, contentHeight: 0 };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const inputOrder = new Map(nodes.map((n, i) => [n.id, i]));

  // Column = longest path from a source-less node. A visited set guards
  // against cycles: a back-reference contributes column 0 instead of
  // recursing forever.
  const colOf = new Map<string, number>();
  const visiting = new Set<string>();
  const resolveCol = (id: string): number => {
    const known = colOf.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const sources = (byId.get(id)?.sources ?? []).filter((s) => byId.has(s));
    const col =
      sources.length === 0 ? 0 : Math.max(...sources.map(resolveCol)) + 1;
    visiting.delete(id);
    colOf.set(id, col);
    return col;
  };
  nodes.forEach((n) => resolveCol(n.id));

  const columnCount = Math.max(...nodes.map((n) => colOf.get(n.id)!)) + 1;
  const columns: PipelineNodeInput[][] = Array.from(
    { length: columnCount },
    () => [],
  );
  nodes.forEach((n) => columns[colOf.get(n.id)!].push(n));

  // Provisional stacking pass. Column 0 keeps query order; every later
  // column orders its nodes by the average vertical centre of their
  // producers so a fan-out stays adjacent to its source. Ties keep input
  // order, which also stacks a suggestion below existing cards.
  const provisionalY = new Map<string, number>();
  const columnHeights: number[] = [];
  columns.forEach((column, colIndex) => {
    if (colIndex > 0) {
      const producerCentre = (n: PipelineNodeInput): number => {
        const producers = n.sources.filter((s) => provisionalY.has(s));
        if (producers.length === 0) return Number.MAX_SAFE_INTEGER;
        return (
          producers.reduce(
            (sum, s) => sum + provisionalY.get(s)! + byId.get(s)!.height / 2,
            0,
          ) / producers.length
        );
      };
      column.sort(
        (a, b) =>
          producerCentre(a) - producerCentre(b) ||
          inputOrder.get(a.id)! - inputOrder.get(b.id)!,
      );
    }
    let y = 0;
    column.forEach((n) => {
      provisionalY.set(n.id, y);
      y += n.height + rowGap;
    });
    columnHeights.push(y > 0 ? y - rowGap : 0);
  });

  // Centre every column against the tallest one.
  const maxColumnHeight = Math.max(...columnHeights);
  const positions: PipelineLayout["positions"] = {};
  columns.forEach((column, colIndex) => {
    const offset = padding + (maxColumnHeight - columnHeights[colIndex]) / 2;
    column.forEach((n) => {
      positions[n.id] = {
        x: padding + colIndex * (cardWidth + columnGap),
        y: offset + provisionalY.get(n.id)!,
        col: colIndex,
      };
    });
  });

  return {
    positions,
    contentWidth:
      padding * 2 + columnCount * cardWidth + (columnCount - 1) * columnGap,
    contentHeight: padding * 2 + maxColumnHeight,
  };
};
