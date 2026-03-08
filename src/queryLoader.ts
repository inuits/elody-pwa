import * as GeneratedQueries from "@/generated-types/queries";

export * from "@/generated-types/queries";

export const GetPrimaryMediafileFromEntityDocument =
  "GetPrimaryMediafileFromEntityDocument" in GeneratedQueries
    ? (GeneratedQueries as any).GetPrimaryMediafileFromEntityDocument
    : null;

export type GetPrimaryMediafileFromEntityQuery =
  typeof GeneratedQueries extends {
    GetPrimaryMediafileFromEntityDocument: infer D;
  }
    ? D extends import("graphql").TypedDocumentNode<infer T, any>
      ? T
      : any
    : Record<string, any>;

export const PostStartImportDocument =
  "PostStartImportDocument" in GeneratedQueries
    ? (GeneratedQueries as any).PostStartImportDocument
    : null;

export const FetchMediafilesOfEntityDocument =
  "FetchMediafilesOfEntityDocument" in GeneratedQueries
    ? (GeneratedQueries as any).FetchMediafilesOfEntityDocument
    : null;
