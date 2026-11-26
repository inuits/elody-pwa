import {
  ApolloLink,
  Observable,
  type FetchResult,
  type Operation,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, print } from "graphql";

const CONFIG_ROOT_FIELDS = new Set([
  "PaginationLimitOptions",
  "PreviewComponents",
  "FilterMatcherMapping",
  "CustomFormattersSettings",
  "EntityTypeSortOptions",
  "EntityTypeGroupByOptions",
  "EntityTypeFilters",
  "BulkOperations",
  "CustomBulkOperations",
]);

const PERMISSION_TRIMMED = /\bcan\b|\b(permitted|readOnly)\s*\(/;

const cacheKey = (operation: Operation): string | undefined => {
  const definition = getMainDefinition(operation.query);
  if (
    definition.kind !== Kind.OPERATION_DEFINITION ||
    definition.operation !== "query"
  )
    return undefined;
  const isConfigOnly = definition.selectionSet.selections.every(
    (selection) =>
      selection.kind === Kind.FIELD &&
      CONFIG_ROOT_FIELDS.has(selection.name.value),
  );
  if (!isConfigOnly) return undefined;
  const source = print(operation.query);
  if (PERMISSION_TRIMMED.test(source)) return undefined;
  const tenant = operation.getContext().headers?.["X-Tenant-ID"] ?? "";
  return JSON.stringify([tenant, source, operation.variables]);
};

export const createConfigCacheLink = (): ApolloLink => {
  const responses = new Map<string, Promise<FetchResult>>();

  return new ApolloLink((operation, forward) => {
    const key = cacheKey(operation);
    if (!key) return forward(operation);

    let response = responses.get(key);
    if (!response) {
      response = new Promise<FetchResult>((resolve, reject) =>
        forward(operation).subscribe({ next: resolve, error: reject }),
      );
      responses.set(key, response);
      response.then(
        (result) => {
          if (result.errors?.length) responses.delete(key);
        },
        () => responses.delete(key),
      );
    }

    return new Observable<FetchResult>((observer) => {
      response.then(
        (result) => {
          observer.next(structuredClone(result));
          observer.complete();
        },
        (error) => observer.error(error),
      );
    });
  });
};
