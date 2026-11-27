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
  "commentsElement",
]);
const PERMISSION_LIST_FIELDS = new Set(["permitted", "readOnly"]);
const ENTITY_VALUE_FIELDS = new Set(["selectedOptions"]);
const RELATION_TYPE_FIELD = "relationType";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const fieldNode = (name: string): SelectionNode => ({
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: name },
});

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
  if (
    selections.some(
      (selection) =>
        selection.kind === Kind.FIELD &&
        ENTITY_VALUE_FIELDS.has(selection.name.value),
    )
  )
    selections.push(fieldNode(RELATION_TYPE_FIELD));
  return selections.length ? { ...selectionSet, selections } : undefined;
};

const withUsedFragments = (
  document: DocumentNode,
  prunedFragments: Map<string, FragmentDefinitionNode | null>,
): DocumentNode => {
  const withPrunedFragments: DocumentNode = {
    ...document,
    definitions: [
      ...document.definitions,
      ...[...prunedFragments.values()].filter(
        (fragment): fragment is FragmentDefinitionNode => !!fragment,
      ),
    ],
  };
  const used = usedFragmentNames(withPrunedFragments);
  return {
    ...withPrunedFragments,
    definitions: withPrunedFragments.definitions.filter(
      (definition) =>
        definition.kind !== Kind.FRAGMENT_DEFINITION ||
        used.has(definition.name.value),
    ),
  };
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
  const lean = withUsedFragments(withoutLayout, prunedFragments);
  leanDocuments.set(document, lean);
  return lean;
};

const withoutSelectedOptionsDocuments = new WeakMap<
  DocumentNode,
  DocumentNode
>();

export const withoutSelectedOptions = (
  document: DocumentNode,
): DocumentNode => {
  const known = withoutSelectedOptionsDocuments.get(document);
  if (known) return known;
  const stripped = visit(document, {
    Field: (field) =>
      ENTITY_VALUE_FIELDS.has(field.name.value) ? null : undefined,
  });
  withoutSelectedOptionsDocuments.set(document, stripped);
  return stripped;
};

const selectedOptionsDocuments = new WeakMap<DocumentNode, DocumentNode>();

export const selectedOptionsDocument = (
  document: DocumentNode,
): DocumentNode => {
  const known = selectedOptionsDocuments.get(document);
  if (known) return known;
  const fragments = fragmentsOf(document);
  const prunedFragments = new Map<string, FragmentDefinitionNode | null>();
  const pruned = visit(document, {
    OperationDefinition: (operation) => ({
      ...operation,
      name: operation.name && {
        ...operation.name,
        value: `${operation.name.value}SelectedOptions`,
      },
      selectionSet: {
        ...operation.selectionSet,
        selections: operation.selectionSet.selections.map((root) =>
          root.kind === Kind.FIELD && root.selectionSet
            ? {
                ...root,
                selectionSet: pruneToEntityValues(
                  root.selectionSet,
                  fragments,
                  prunedFragments,
                ) ?? {
                  kind: Kind.SELECTION_SET,
                  selections: [fieldNode("__typename")],
                },
              }
            : root,
        ),
      },
    }),
  });
  const labels = withUsedFragments(pruned, prunedFragments);
  selectedOptionsDocuments.set(document, labels);
  return labels;
};

export type EntitySelectedOptions = {
  entityId: string;
  byRelation: Promise<Map<string, unknown[] | null>>;
};

export const selectedOptionsByRelation = (
  result: unknown,
): Map<string, unknown[] | null> => {
  const byRelation = new Map<string, unknown[] | null>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!isPlainObject(value)) return;
    const options = value.selectedOptions;
    const relationType = value[RELATION_TYPE_FIELD];
    if (Array.isArray(options) && typeof relationType === "string") {
      const known = byRelation.get(relationType);
      byRelation.set(
        relationType,
        known === undefined ||
          (known && JSON.stringify(known) === JSON.stringify(options))
          ? options
          : null,
      );
    }
    Object.values(value).forEach(walk);
  };
  walk(result);
  return byRelation;
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

export const entityPageDocuments = (document: DocumentNode) => {
  const entity = withoutSelectedOptions(document);
  return {
    entity,
    lean: leanEntityDocument(entity),
    labels: selectedOptionsDocument(document),
  };
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

export const storeEntityLayout = (key: EntityLayoutKey, layout: unknown) => {
  layouts.set(keyOf(key), layout);
};

export const clearEntityLayouts = () => layouts.clear();
