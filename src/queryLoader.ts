import * as GeneratedQueries from "@/generated-types/queries";

export * from "@/generated-types/queries";

export const GetPrimaryMediafileFromEntityDocument =
  (GeneratedQueries as any).GetPrimaryMediafileFromEntityDocument ?? null;

export type GetPrimaryMediafileFromEntityQuery =
  typeof GeneratedQueries extends { GetPrimaryMediafileFromEntityDocument: infer D }
    ? (D extends import('graphql').TypedDocumentNode<infer T, any> ? T : any)
    : Record<string, any>;

export const PostStartImportDocument =
  (GeneratedQueries as any).PostStartImportDocument ?? null;
