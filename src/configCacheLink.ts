import {
  ApolloLink,
  Observable,
  type FetchResult,
  type DocumentNode,
  type Operation,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, print, visit } from "graphql";

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

const configQuery = (query: DocumentNode) => {
  const definition = getMainDefinition(query);
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
  return isConfigOnly ? definition : undefined;
};

export const isSessionCachedConfig = (query: DocumentNode): boolean =>
  !!configQuery(query) && !PERMISSION_TRIMMED.test(print(query));

const permissionFields = (query: DocumentNode) => {
  const keys = new Set<string>();
  let inArgument = false;
  visit(query, {
    Field(field) {
      const name = field.name.value;
      if (
        name === "can" ||
        ((name === "permitted" || name === "readOnly") &&
          field.arguments?.length)
      )
        keys.add(field.alias?.value ?? name);
    },
    ObjectField(field) {
      if (field.name.value === "can") inArgument = true;
    },
    Argument(argument) {
      if (argument.name.value === "can") inArgument = true;
    },
  });
  return { keys, inArgument };
};

const containsKey = (value: unknown, keys: Set<string>): boolean => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value))
    return value.some((item) => containsKey(item, keys));
  return Object.entries(value).some(
    ([key, child]) => keys.has(key) || containsKey(child, keys),
  );
};

const cacheableFor = (query: DocumentNode, result: FetchResult): boolean => {
  if (result.errors?.length || !result.data) return false;
  const { keys, inArgument } = permissionFields(query);
  return !inArgument && keys.size > 0 && !containsKey(result.data, keys);
};

const cacheKey = (operation: Operation): string | undefined => {
  if (!configQuery(operation.query)) return undefined;
  const tenant = operation.getContext().headers?.["X-Tenant-ID"] ?? "";
  return JSON.stringify([tenant, print(operation.query), operation.variables]);
};

const answer = (response: Promise<FetchResult>) =>
  new Observable<FetchResult>((observer) => {
    response.then(
      (result) => {
        observer.next(structuredClone(result));
        observer.complete();
      },
      (error) => observer.error(error),
    );
  });

export const createConfigCacheLink = (): ApolloLink => {
  const responses = new Map<string, Promise<FetchResult>>();

  return new ApolloLink((operation, forward) => {
    const key = cacheKey(operation);
    if (!key) return forward(operation);

    const known = responses.get(key);
    if (known) return answer(known);

    if (!isSessionCachedConfig(operation.query))
      return forward(operation).map((result) => {
        if (cacheableFor(operation.query, result))
          responses.set(key, Promise.resolve(structuredClone(result)));
        return result;
      });

    const response = new Promise<FetchResult>((resolve, reject) =>
      forward(operation).subscribe({ next: resolve, error: reject }),
    );
    responses.set(key, response);
    response.then(
      (result) => {
        if (result.errors?.length) responses.delete(key);
      },
      () => responses.delete(key),
    );
    return answer(response);
  });
};
