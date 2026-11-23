export type OrderCsvRow = { id: string; name: string; line: string };

const FILENAME_COLUMNS = ["filename", "file_identifier", "title"];

const splitCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let currentField = "";
  let insideQuotes = false;
  for (let position = 0; position < line.length; position++) {
    const character = line[position];
    const isEscapedQuote =
      insideQuotes && character === '"' && line[position + 1] === '"';

    if (isEscapedQuote) {
      currentField += '"';
      position++;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      fields.push(currentField);
      currentField = "";
    } else {
      currentField += character;
    }
  }
  fields.push(currentField);
  return fields;
};

export const moveItem = <T>(order: T[], from: number, to: number): T[] => {
  const result = [...order];
  const [item] = result.splice(from, 1);
  result.splice(Math.max(0, Math.min(result.length, to)), 0, item);
  return result;
};

export const pageOfIndex = (index: number, pageSize: number): number =>
  Math.floor(index / pageSize);

export const isValidPosition = (position: number, total: number): boolean =>
  Number.isInteger(position) && position >= 1 && position <= total;

export const dropLineClass = (
  index: number,
  draggedIndex: number | undefined,
  hoveredIndex: number | undefined,
): string => {
  const isDropTarget =
    draggedIndex !== undefined &&
    index === hoveredIndex &&
    index !== draggedIndex;
  if (!isDropTarget) return "";
  const styles = {
    before: "shadow-reorder-drop-before",
    after: "shadow-reorder-drop-after",
  };
  if (draggedIndex > index) return styles.before;
  return styles.after;
};

// ponytail: one record per line; a filename with a newline in it breaks this
export const parseOrderCsv = (
  csv: string,
): { header: string; rows: OrderCsvRow[] } => {
  const [header, ...lines] = csv.split(/\r?\n/).filter((line) => line !== "");
  const columns = splitCsvLine(header);
  const filenameIndex = columns.findIndex((column) =>
    FILENAME_COLUMNS.includes(column),
  );
  const rows = lines.map((line) => {
    const fields = splitCsvLine(line);
    return { id: fields[0], name: fields[filenameIndex] ?? fields[0], line };
  });
  return { header, rows };
};

export const serializeOrderCsv = (
  header: string,
  order: string[],
  rows: OrderCsvRow[],
): string => {
  const lineById = new Map(rows.map((row) => [row.id, row.line]));
  return [header, ...order.map((id) => lineById.get(id))].join("\n");
};

// Each client's order endpoint has its own CSV columns, so rows go back unchanged
export const fetchOrderCsv = async (parentId: string): Promise<string> => {
  const response = await fetch("/api/download/csv?return_type=mediafile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.text();
};

export const saveOrderCsv = async (
  parentId: string,
  csv: string,
): Promise<void> => {
  const response = await fetch(`/api/upload/csv?parentId=${parentId}`, {
    method: "POST",
    headers: { "Content-Type": "text/csv" },
    body: csv,
  });
  if (!response.ok) throw new Error(await response.text());
};
