import {
  ApolloLink,
  Observable,
  type FetchResult,
  type DocumentNode,
  type Operation,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, print, visit, type FieldNode } from "graphql";

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

const hasCanArgument = (field: FieldNode) => {
  let found = false;
  (field.arguments ?? []).forEach((argument) =>
    visit(argument, {
      Argument(node) {
        if (node.name.value === "can") found = true;
      },
      ObjectField(node) {
        if (node.name.value === "can") found = true;
      },
    }),
  );
  return found;
};

const permissionFields = (query: DocumentNode) => {
  const keys = new Set<string>();
  visit(query, {
    Field(field) {
      const name = field.name.value;
      if (
        name === "can" ||
        ((name === "permitted" || name === "readOnly") &&
          field.arguments?.length) ||
        hasCanArgument(field)
      )
        keys.add(field.alias?.value ?? name);
    },
  });
  return keys;
};

export const isSessionCachedConfig = (query: DocumentNode): boolean =>
  !!configQuery(query) && permissionFields(query).size === 0;

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
  const keys = permissionFields(query);
  return keys.size > 0 && !containsKey(result.data, keys);
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

type ConfigStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;

const STORAGE_PREFIX = "config-cache|";

const hashOf = (text: string) => {
  let a = 0xdeadbeef;
  let b = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    a = Math.imul(a ^ code, 2654435761);
    b = Math.imul(b ^ code, 1597334677);
  }
  a =
    Math.imul(a ^ (a >>> 16), 2246822507) ^
    Math.imul(b ^ (b >>> 13), 3266489909);
  b =
    Math.imul(b ^ (b >>> 16), 2246822507) ^
    Math.imul(a ^ (a >>> 13), 3266489909);
  return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36);
};

const loadStored = (storage: ConfigStorage | undefined, name: string) => {
  try {
    if (!storage) return {};
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key !== name)
        storage.removeItem(key);
    }
    return JSON.parse(storage.getItem(name) ?? "{}") as Record<
      string,
      FetchResult
    >;
  } catch {
    return {};
  }
};

export const createConfigCacheLink = ({
  storage,
  scope = "",
}: { storage?: ConfigStorage; scope?: string } = {}): ApolloLink => {
  const storageName = `${STORAGE_PREFIX}${scope}`;
  const stored = loadStored(storage, storageName);
  const responses = new Map<string, Promise<FetchResult>>(
    Object.entries(stored).map(([key, result]) => [
      key,
      Promise.resolve(result),
    ]),
  );
  const remember = (key: string, result: FetchResult) => {
    stored[key] = result;
    try {
      storage?.setItem(storageName, JSON.stringify(stored));
    } catch {}
  };

  return new ApolloLink((operation, forward) => {
    const fullKey = cacheKey(operation);
    if (!fullKey) return forward(operation);
    const key = hashOf(fullKey);

    const known = responses.get(key);
    if (known) return answer(known);

    if (!isSessionCachedConfig(operation.query))
      return forward(operation).map((result) => {
        if (cacheableFor(operation.query, result)) {
          const copy = structuredClone(result);
          responses.set(key, Promise.resolve(copy));
          remember(key, copy);
        }
        return result;
      });

    const response = new Promise<FetchResult>((resolve, reject) =>
      forward(operation).subscribe({ next: resolve, error: reject }),
    );
    responses.set(key, response);
    response.then(
      (result) => {
        if (result.errors?.length) responses.delete(key);
        else remember(key, result);
      },
      () => responses.delete(key),
    );
    return answer(response);
  });
};
