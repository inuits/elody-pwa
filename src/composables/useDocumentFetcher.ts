import type { DocumentMap, DocumentName } from "@/generated-types/document-map";

let cachedDocuments: Record<string, any> | null = null;

export const fetchDocuments = async (): Promise<Record<string, any>> => {
  if (cachedDocuments) return cachedDocuments;

  try {
    const res = await fetch("/api/documents", { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to fetch documents: ${res.status}`);
      cachedDocuments = {};
      return cachedDocuments;
    }
    cachedDocuments = await res.json();
    console.log(
      `Loaded ${Object.keys(cachedDocuments!).length} GraphQL document nodes`,
    );
    return cachedDocuments!;
  } catch (e: any) {
    console.error(`Failed to fetch documents: ${e.message}`);
    cachedDocuments = {};
    return cachedDocuments;
  }
};

export function getDocument<K extends DocumentName>(name: K): DocumentMap[K] | undefined;
export function getDocument(name: string): any;
export function getDocument(name: string): any {
  if (!cachedDocuments) {
    console.warn(
      `getDocument("${name}") called before documents were loaded. Call fetchDocuments() first.`,
    );
    return undefined;
  }
  const doc = cachedDocuments[name];
  if (!doc) {
    console.warn(`Document "${name}" not found in cached documents.`);
  }
  return doc;
}
