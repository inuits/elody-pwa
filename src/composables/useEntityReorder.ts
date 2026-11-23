export type OrderCsvRow = { id: string; name: string; line: string };

// Base serves `filename`, clients may serve their own column.
const NAME_COLUMNS = ["filename", "file_identifier", "title"];

const splitCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted && char === '"' && line[i + 1] === '"') {
      field += '"';
      i++;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else field += char;
  }
  fields.push(field);
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

// ponytail: one record per line; a filename with a newline in it breaks this
export const parseOrderCsv = (
  csv: string,
): { header: string; rows: OrderCsvRow[] } => {
  const [header, ...lines] = csv.split(/\r?\n/).filter((line) => line !== "");
  const columns = splitCsvLine(header);
  const nameIndex = columns.findIndex((column) =>
    NAME_COLUMNS.includes(column),
  );
  const rows = lines.map((line) => {
    const fields = splitCsvLine(line);
    return { id: fields[0], name: fields[nameIndex] ?? fields[0], line };
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

// The parent's order endpoint reads and writes its own CSV format, so the
// rows are sent back as they came, only in a new order.
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
