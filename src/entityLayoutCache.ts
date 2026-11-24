import {
  Kind,
  visit,
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionNode,
  type SelectionSetNode,
} from "graphql";

const LAYOUT_FIELD = "entityView";
const ENTITY_READING_FIELDS = new Set([
  "can",
  "bulkData",
  "relation",
  "info",
  "thumbnail",
  "mapMetadata",
  "mapElement",
  "graphElement",
  "entityViewerElement",
  "markdownViewerElement",
  "manifestViewerElement",
]);
const PERMISSION_LIST_FIELDS = new Set(["permitted", "readOnly"]);
const ENTITY_VALUE_FIELDS = new Set(["selectedOptions"]);

const fragmentsOf = (document: DocumentNode) =>
  new Map(
    document.definitions
      .filter(
        (definition): definition is FragmentDefinitionNode =>
          definition.kind === Kind.FRAGMENT_DEFINITION,
      )
      .map((fragment) => [fragment.name.value, fragment]),
  );

const usedFragmentNames = (document: DocumentNode): Set<string> => {
  const fragments = fragmentsOf(document);
  const used = new Set<string>();
  const walk = (node: unknown) =>
    visit(node as DocumentNode, {
      FragmentSpread(spread) {
        const name = spread.name.value;
        if (used.has(name)) return;
        used.add(name);
        const fragment = fragments.get(name);
        if (fragment) walk(fragment);
      },
    });
  document.definitions
    .filter((definition) => definition.kind === Kind.OPERATION_DEFINITION)
    .forEach(walk);
  return used;
};

const pruneToEntityValues = (
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>,
  prunedFragments: Map<string, FragmentDefinitionNode | null>,
): SelectionSetNode | undefined => {
  const prune = (set: SelectionSetNode) =>
    pruneToEntityValues(set, fragments, prunedFragments);
  const selections = selectionSet.selections.flatMap(
    (selection): SelectionNode[] => {
      if (selection.kind === Kind.FIELD) {
        if (ENTITY_VALUE_FIELDS.has(selection.name.value)) return [selection];
        const pruned = selection.selectionSet && prune(selection.selectionSet);
        return pruned ? [{ ...selection, selectionSet: pruned }] : [];
      }
      if (selection.kind === Kind.INLINE_FRAGMENT) {
        const pruned = prune(selection.selectionSet);
        return pruned ? [{ ...selection, selectionSet: pruned }] : [];
      }
      const name = `${selection.name.value}__entityValues`;
      if (!prunedFragments.has(name)) {
        prunedFragments.set(name, null);
        const fragment = fragments.get(selection.name.value);
        const pruned = fragment && prune(fragment.selectionSet);
        prunedFragments.set(
          name,
          pruned && fragment
            ? {
                ...fragment,
                name: { kind: Kind.NAME, value: name },
                selectionSet: pruned,
              }
            : null,
        );
      }
      return prunedFragments.get(name)
        ? [{ ...selection, name: { kind: Kind.NAME, value: name } }]
        : [];
    },
  );
  return selections.length ? { ...selectionSet, selections } : undefined;
};

const leanDocuments = new WeakMap<DocumentNode, DocumentNode>();

export const leanEntityDocument = (document: DocumentNode): DocumentNode => {
  const known = leanDocuments.get(document);
  if (known) return known;
  const fragments = fragmentsOf(document);
  const prunedFragments = new Map<string, FragmentDefinitionNode | null>();
  const withoutLayout = visit(document, {
    Field: (field) => {
      if (field.name.value !== LAYOUT_FIELD) return undefined;
      const pruned =
        field.selectionSet &&
        pruneToEntityValues(field.selectionSet, fragments, prunedFragments);
      return pruned ? { ...field, selectionSet: pruned } : null;
    },
    SelectionSet: {
      leave: (selectionSet): SelectionSetNode | undefined =>
        selectionSet.selections.length
          ? undefined
          : {
              ...selectionSet,
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { kind: Kind.NAME, value: "__typename" },
                },
              ],
            },
    },
  });
  const withPrunedFragments: DocumentNode = {
    ...withoutLayout,
    definitions: [
      ...withoutLayout.definitions,
      ...[...prunedFragments.values()].filter(
        (fragment): fragment is FragmentDefinitionNode => !!fragment,
      ),
    ],
  };
  const used = usedFragmentNames(withPrunedFragments);
  const lean: DocumentNode = {
    ...withPrunedFragments,
    definitions: withPrunedFragments.definitions.filter(
      (definition) =>
        definition.kind !== Kind.FRAGMENT_DEFINITION ||
        used.has(definition.name.value),
    ),
  };
  leanDocuments.set(document, lean);
  return lean;
};

const readsTheEntity = (
  selectionSet: SelectionSetNode | undefined,
  fragments: Map<string, FragmentDefinitionNode>,
  seen = new Set<string>(),
): boolean =>
  (selectionSet?.selections ?? []).some((selection: SelectionNode) => {
    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const name = selection.name.value;
      if (seen.has(name)) return false;
      seen.add(name);
      return readsTheEntity(fragments.get(name)?.selectionSet, fragments, seen);
    }
    if (selection.kind === Kind.INLINE_FRAGMENT)
      return readsTheEntity(selection.selectionSet, fragments, seen);
    const name = selection.name.value;
    if (ENTITY_READING_FIELDS.has(name)) return true;
    if (PERMISSION_LIST_FIELDS.has(name) && selection.arguments?.length)
      return true;
    return readsTheEntity(selection.selectionSet, fragments, seen);
  });

const typeSwitches = (
  selectionSet: SelectionSetNode | undefined,
  fragments: Map<string, FragmentDefinitionNode>,
  found = new Set<string>(),
  seen = new Set<string>(),
): Set<string> => {
  for (const selection of selectionSet?.selections ?? []) {
    if (selection.kind === Kind.INLINE_FRAGMENT) {
      if (selection.typeCondition)
        found.add(selection.typeCondition.name.value);
      typeSwitches(selection.selectionSet, fragments, found, seen);
    }
    if (
      selection.kind === Kind.FRAGMENT_SPREAD &&
      !seen.has(selection.name.value)
    ) {
      seen.add(selection.name.value);
      typeSwitches(
        fragments.get(selection.name.value)?.selectionSet,
        fragments,
        found,
        seen,
      );
    }
  }
  return found;
};

const cacheableByDocument = new WeakMap<DocumentNode, Map<string, boolean>>();

export const layoutIsCacheable = (
  document: DocumentNode,
  typename: string,
): boolean => {
  const byType = cacheableByDocument.get(document) ?? new Map();
  cacheableByDocument.set(document, byType);
  if (!byType.has(typename))
    byType.set(typename, judgeLayout(document, typename));
  return byType.get(typename)!;
};

const judgeLayout = (document: DocumentNode, typename: string): boolean => {
  const fragments = fragmentsOf(document);
  const operation = document.definitions.find(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION,
  );
  if (operation?.kind !== Kind.OPERATION_DEFINITION) return false;
  const root = operation.selectionSet.selections.find(
    (selection) => selection.kind === Kind.FIELD,
  );
  if (root?.kind !== Kind.FIELD) return false;
  const concreteTypes = typeSwitches(root.selectionSet, fragments);
  const appliesTo = (condition?: string) =>
    !condition || condition === typename || !concreteTypes.has(condition);

  let cacheable = true;
  const seen = new Set<string>();
  const walkEntityLevel = (selectionSet: SelectionSetNode | undefined) => {
    for (const selection of selectionSet?.selections ?? []) {
      if (selection.kind === Kind.FIELD) {
        if (
          selection.name.value === LAYOUT_FIELD &&
          readsTheEntity(selection.selectionSet, fragments)
        )
          cacheable = false;
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        if (appliesTo(selection.typeCondition?.name.value))
          walkEntityLevel(selection.selectionSet);
      } else if (!seen.has(selection.name.value)) {
        seen.add(selection.name.value);
        const fragment = fragments.get(selection.name.value);
        if (fragment && appliesTo(fragment.typeCondition.name.value))
          walkEntityLevel(fragment.selectionSet);
      }
    }
  };
  walkEntityLevel(root.selectionSet);
  return cacheable;
};

export type EntityLayoutKey = {
  tenant: string;
  user: string;
  entityType: string;
};

const layouts = new Map<string, unknown>();
const keyOf = ({ tenant, user, entityType }: EntityLayoutKey) =>
  JSON.stringify([tenant, user, entityType]);

export const cachedEntityLayout = (key: EntityLayoutKey): unknown =>
  layouts.get(keyOf(key));

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const withoutEntityValues = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withoutEntityValues);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !ENTITY_VALUE_FIELDS.has(key))
      .map(([key, item]) => [key, withoutEntityValues(item)]),
  );
};

export const mergeEntityLayout = (base: unknown, overlay: unknown): unknown => {
  if (overlay === undefined) return base;
  if (Array.isArray(base) && Array.isArray(overlay))
    return base.map((item, index) => mergeEntityLayout(item, overlay[index]));
  if (isPlainObject(base) && isPlainObject(overlay))
    return Object.fromEntries(
      [...new Set([...Object.keys(base), ...Object.keys(overlay)])].map(
        (key) => [key, mergeEntityLayout(base[key], overlay[key])],
      ),
    );
  return overlay;
};

export const storeEntityLayout = (key: EntityLayoutKey, layout: unknown) => {
  layouts.set(keyOf(key), withoutEntityValues(layout));
};

export const clearEntityLayouts = () => layouts.clear();
