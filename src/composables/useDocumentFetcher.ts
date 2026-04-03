import type { DocumentMap, DocumentName } from "@/generated-types/document-map";

type DocumentState =
  | { status: "idle" }
  | { status: "loaded"; documents: Record<string, any> }
  | { status: "error" };

let state: DocumentState = { status: "idle" };

export const fetchDocuments = async (): Promise<Record<string, any>> => {
  if (state.status !== "idle") {
    return state.status === "loaded" ? state.documents : {};
  }

  try {
    const res = await fetch("/api/documents", { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to fetch documents: ${res.status}`);
      state = { status: "error" };
      return {};
    }
    const documents = await res.json();
    state = { status: "loaded", documents };
    console.log(
      `Loaded ${Object.keys(documents).length} GraphQL document nodes`,
    );
    return documents;
  } catch (e: any) {
    console.error(`Failed to fetch documents: ${e.message}`);
    state = { status: "error" };
    return {};
  }
};

export function getDocument<K extends DocumentName>(
  name: K,
): DocumentMap[K] | undefined;
export function getDocument(name: string): any;
export function getDocument(name: string): any {
  if (state.status === "idle") {
    console.warn(
      `getDocument("${name}") called before documents were loaded. Call fetchDocuments() first.`,
    );
    return undefined;
  }
  if (state.status === "error") {
    console.warn(
      `getDocument("${name}") called but documents failed to load.`,
    );
    return undefined;
  }
  const doc = state.documents[name];
  if (!doc) {
    console.warn(`Document "${name}" not found in cached documents.`);
  }
  return doc;
}
