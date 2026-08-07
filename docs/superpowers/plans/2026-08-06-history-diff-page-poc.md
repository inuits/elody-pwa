# History Diff Page POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a POC of a dedicated history-comparison page for `ugent-aicap`'s `inscription` entity type — current state vs. a user-selected historical version, with relation fields (single- and multi-value) diffed and labeled correctly.

**Architecture:** Reuse the existing `EntitiesHistory` GraphQL query called with the *concrete* entity type (`inscription`, not the generic `history` sentinel) to fetch fully-hydrated historical `Inscription` snapshots with zero backend/schema changes for fetching. Add exactly one new piece of backend logic — a generic, batched `RelationLabelsForIds` resolver in `modules/baseGraphql` — needed because multi-value relations only resolve to a single joined string today, not the structured per-item data a set-diff needs. Diffing reuses the existing `computeEntityDiff` logic from `useEntityDiff.ts` (hoisted to a module-level export, behavior-preserving) for scalar/single-relation fields, plus new pure-function composables for relation-list set-diffing, feeding a new `RelationDiffList.vue` chip component.

**Tech Stack:** Vue 3 Composition API + TypeScript + Apollo Client (PWA), Apollo Server / GraphQL Modules (baseGraphql), Vitest + `@vue/test-utils` for tests.

## Global Constraints

- No collection-api (REST) changes of any kind.
- BFF-level changes (GraphQL query documents and resolver logic in `modules/baseGraphql`) are allowed, but never a duplicated GraphQL type per entity/client (e.g. no `InscriptionHistory` type) — reuse the existing `Inscription` type.
- Do not modify `inuits-dams-pwa/src/composables/useEntityDiff.ts`'s behavior or `src/components/previews/HistoryDiffPreview.vue` — only a behavior-preserving refactor (hoisting a function to module scope) is allowed in `useEntityDiff.ts`, verified by the existing test suite staying green.
- POC scope: `ugent-aicap` client, `inscription` entity type only.
- All new resolver logic lives directly in `modules/baseGraphql` for now (not a new dedicated module).
- Every repo touched works on the branch `feat-139250-full-history` (already created and checked out in `inuits-dams-pwa`, `modules/baseGraphql`, and `clients/ugent-aicap/client-frontend/inuits-dams-graphql-service`).
- Full context: `inuits-dams-pwa/docs/superpowers/specs/2026-08-06-history-diff-page-design.md`.
- Scope note: this POC only diffs a fixed, explicit field list (`significance`, `refLanguage`, `refScript` as scalars/single-relations, `refWords` as the one multi-value relation demonstrated) rather than every field on `inscription`. The spec's open item about `WysiwygElement`/rich-text fields needing a coarse-changed-flag treatment is therefore not exercised by this POC — none of the chosen fields are rich text. Extending the field list to cover rich-text fields is follow-up work, not part of this plan.

---

### Task 1: `RelationLabelsForIds` batched resolver (`modules/baseGraphql`)

**Files:**
- Modify: `modules/baseGraphql/resolvers/intialValueResolver.ts` (export `fetchRelationEntity` and `extractValueFromEntity`, currently private — no other change)
- Create: `modules/baseGraphql/resolvers/relationLabelsResolver.ts`
- Modify: `modules/baseGraphql/baseModule/baseSchema.schema.ts` (add `RelationLabelsForIds` field to `type Query`)
- Modify: `modules/baseGraphql/baseModule/baseResolver.ts` (register the resolver)
- Test: `modules/baseGraphql/test/relationLabelsResolver.test.ts`

**Interfaces:**
- Produces: `resolveRelationLabelsForIds(dataSources: DataSources, ids: string[], type: string, metadataKeyAsLabel: string): Promise<{ key: string; value: string }[]>`, exported from `modules/baseGraphql/resolvers/relationLabelsResolver.ts`. Later tasks (client query documents) rely on this being reachable via GraphQL field `RelationLabelsForIds(ids: [String!]!, type: String!, metadataKeyAsLabel: String): [KeyAndValue!]!`.

- [ ] **Step 1: Write the failing test**

```ts
// modules/baseGraphql/test/relationLabelsResolver.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveRelationLabelsForIds } from '../resolvers/relationLabelsResolver';
import { DataSources } from '../types';

const mockDataSource = {
  CollectionAPI: {
    getEntity: vi.fn(),
  },
};

describe('resolveRelationLabelsForIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves a label for each id using metadataKeyAsLabel', async () => {
    mockDataSource.CollectionAPI.getEntity
      .mockResolvedValueOnce({ metadata: [{ key: 'name', value: 'Aramaic' }] })
      .mockResolvedValueOnce({ metadata: [{ key: 'name', value: 'Greek' }] });

    const result = await resolveRelationLabelsForIds(
      mockDataSource as unknown as DataSources,
      ['lang-1', 'lang-2'],
      'language',
      'name'
    );

    expect(result).toStrictEqual([
      { key: 'lang-1', value: 'Aramaic' },
      { key: 'lang-2', value: 'Greek' },
    ]);
    expect(mockDataSource.CollectionAPI.getEntity).toHaveBeenCalledTimes(2);
  });

  it('falls back to the raw id when the related entity cannot be found', async () => {
    mockDataSource.CollectionAPI.getEntity.mockResolvedValueOnce(null);

    const result = await resolveRelationLabelsForIds(
      mockDataSource as unknown as DataSources,
      ['missing-id'],
      'language',
      'name'
    );

    expect(result).toStrictEqual([{ key: 'missing-id', value: 'missing-id' }]);
  });

  it('resolves an empty list without calling the data source', async () => {
    const result = await resolveRelationLabelsForIds(
      mockDataSource as unknown as DataSources,
      [],
      'language',
      'name'
    );

    expect(result).toStrictEqual([]);
    expect(mockDataSource.CollectionAPI.getEntity).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run (from `modules/baseGraphql`): `pnpm vitest run test/relationLabelsResolver.test.ts`
Expected: FAIL — `relationLabelsResolver` module does not exist.

- [ ] **Step 3: Export the two helpers `relationLabelsResolver.ts` needs**

In `modules/baseGraphql/resolvers/intialValueResolver.ts`, change the two private declarations to exported:

```ts
export const fetchRelationEntity = async (
```

and

```ts
export const extractValueFromEntity = (
```

(No other change to either function's body.)

- [ ] **Step 4: Write the resolver implementation**

```ts
// modules/baseGraphql/resolvers/relationLabelsResolver.ts
import { fetchRelationEntity, extractValueFromEntity } from './intialValueResolver';
import { DataSources } from '../types';

export const resolveRelationLabelsForIds = async (
  dataSources: DataSources,
  ids: string[],
  type: string,
  metadataKeyAsLabel: string
): Promise<{ key: string; value: string }[]> => {
  return Promise.all(
    ids.map(async (id) => {
      const relation = { key: id };
      const entity = await fetchRelationEntity(
        dataSources,
        relation,
        type,
        metadataKeyAsLabel,
        '',
        ''
      );
      const value = entity
        ? extractValueFromEntity(entity, relation, metadataKeyAsLabel, '')
        : id;
      return { key: id, value };
    })
  );
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run test/relationLabelsResolver.test.ts`
Expected: PASS (all 3 cases).

- [ ] **Step 6: Wire the resolver into the GraphQL schema**

In `modules/baseGraphql/baseModule/baseSchema.schema.ts`, inside `type Query { ... }`, add a field next to `EntitiesHistory`:

```graphql
    RelationLabelsForIds(
      ids: [String!]!
      type: String!
      metadataKeyAsLabel: String
    ): [KeyAndValue!]!
```

(`KeyAndValue { key: String!, value: String! }` already exists in this file — no new type needed.)

- [ ] **Step 7: Register the resolver**

In `modules/baseGraphql/baseModule/baseResolver.ts`, add the import near the other resolver imports:

```ts
import { resolveRelationLabelsForIds } from '../resolvers/relationLabelsResolver';
```

and add the field to the `Query` resolver map, next to `Entity`/`EntitiesHistory`:

```ts
    RelationLabelsForIds: async (
      _source,
      { ids, type, metadataKeyAsLabel },
      { dataSources }
    ) => {
      return resolveRelationLabelsForIds(dataSources, ids, type, metadataKeyAsLabel);
    },
```

- [ ] **Step 8: Run the full baseGraphql test suite to check for regressions**

Run (from `modules/baseGraphql`): `pnpm vitest run`
Expected: all existing tests still PASS, plus the new `relationLabelsResolver.test.ts`.

- [ ] **Step 9: Commit**

```bash
cd modules/baseGraphql
git add resolvers/relationLabelsResolver.ts resolvers/intialValueResolver.ts baseModule/baseSchema.schema.ts baseModule/baseResolver.ts test/relationLabelsResolver.test.ts
git commit -m "feat: add generic RelationLabelsForIds resolver for batched relation label lookups"
```

---

### Task 2: History + relation-labels query documents (`ugent-aicap` client)

**Files:**
- Create: `clients/ugent-aicap/client-frontend/inuits-dams-graphql-service/src/queries/entities/inscriptionHistory.queries.ts`

**Interfaces:**
- Produces (as GraphQL operations, available to the PWA's codegen after `task generate`): `GetInscriptionHistory(limit: Int, skip: Int, advancedFilterInputs: [AdvancedFilterInput!]!)` and `GetRelationLabelsForIds(ids: [String!]!, type: String!, metadataKeyAsLabel: String)`. Task 7's composable calls these by their generated `Document`/`Query`/`QueryVariables` names (`GetInscriptionHistoryDocument`, `GetRelationLabelsForIdsDocument`, etc., per this project's codegen convention — same pattern as `GetEntityByIdDocument` already used elsewhere).
- Consumes: the existing `fullInscription` fragment (already defined in `inscription.queries.ts` in the same directory — no import statement needed; this project's `graphql-codegen` setup treats every `*.queries.ts` file under `src/` as one combined document set, resolving fragment spreads across files automatically, exactly as `podiumnet.queries.ts`'s `GetEntitiesHistory` already does with fragments defined in `productionHistory.queries.ts`).

This task has no unit test of its own (a GraphQL document has nothing to unit-test in isolation); it's verified by codegen succeeding and, in Task 7's manual verification step, by actually returning data from the running `ugent-aicap` docker environment.

- [ ] **Step 1: Write the query document**

```ts
// clients/ugent-aicap/client-frontend/inuits-dams-graphql-service/src/queries/entities/inscriptionHistory.queries.ts
// @ts-ignore
import { gql } from "graphql-modules";

export const inscriptionHistoryQueries = gql`
  query GetInscriptionHistory(
    $limit: Int
    $skip: Int
    $advancedFilterInputs: [AdvancedFilterInput!]!
  ) {
    EntitiesHistory(
      type: inscription
      limit: $limit
      skip: $skip
      searchInputType: AdvancedInputType
      searchValue: {
        value: ""
        key: "date_updated"
        order_by: "date_updated"
        isAsc: false
      }
      advancedFilterInputs: $advancedFilterInputs
    ) {
      count
      results {
        id
        uuid
        type
        ... on Inscription {
          ...fullInscription
        }
      }
    }
  }

  query GetRelationLabelsForIds(
    $ids: [String!]!
    $type: String!
    $metadataKeyAsLabel: String
  ) {
    RelationLabelsForIds(
      ids: $ids
      type: $type
      metadataKeyAsLabel: $metadataKeyAsLabel
    ) {
      key
      value
    }
  }
`;
```

- [ ] **Step 2: Regenerate types and confirm the schema compiles**

Run (per root `Taskfile.yml`): `task generate`
Expected: completes without GraphQL validation errors (this confirms `inscription` is a valid `Entitytyping` enum value for `EntitiesHistory`'s `type` argument, `fullInscription` resolves as a fragment on `Inscription`, and `RelationLabelsForIds`/`KeyAndValue` from Task 1 are visible in the merged schema). If it fails on `RelationLabelsForIds` not being found, re-check Task 1 Step 6/7 were saved before running this.

- [ ] **Step 3: Commit**

```bash
cd clients/ugent-aicap/client-frontend/inuits-dams-graphql-service
git add src/queries/entities/inscriptionHistory.queries.ts
git commit -m "feat: add GetInscriptionHistory and GetRelationLabelsForIds queries"
```

---

### Task 3: Route registration for the history page (`ugent-aicap` client)

**Files:**
- Modify: `clients/ugent-aicap/client-frontend/inuits-dams-graphql-service/src/aicapRoutes.ts`

**Interfaces:**
- Produces: a route named `HistoryComparison` at path `/:type/:id/history`, whose `component: "HistoryComparison"` string is what Task 7's `router.ts` registration (in `inuits-dams-pwa`) must match exactly.

No unit test — this is static route configuration, verified end-to-end when the page is manually exercised in Task 7.

- [ ] **Step 1: Add the route**

In `clients/ugent-aicap/client-frontend/inuits-dams-graphql-service/src/aicapRoutes.ts`, inside the `children` array, immediately after the existing `SingleEntity` entry:

```ts
      {
        path: "/:type/:id/history",
        name: "HistoryComparison",
        component: "HistoryComparison",
        meta: {
          title: "Entity History",
        },
      },
```

- [ ] **Step 2: Commit**

```bash
cd clients/ugent-aicap/client-frontend/inuits-dams-graphql-service
git add src/aicapRoutes.ts
git commit -m "feat: add /:type/:id/history route"
```

---

### Task 4: Export `computeEntityDiff` + `useHistoryFieldDiff` composable (`inuits-dams-pwa`)

**Files:**
- Modify: `src/composables/useEntityDiff.ts` (hoist `computeEntityDiff` and its helper `formatDisplayValue` to module scope and export `computeEntityDiff` — behavior-preserving, no logic change)
- Create: `src/composables/useHistoryFieldDiff.ts`
- Test: `src/composables/__tests__/useHistoryFieldDiff.test.ts`

**Interfaces:**
- Consumes: `computeEntityDiff` newly exported from `src/composables/useEntityDiff.ts`.
- Produces: `useHistoryFieldDiff(currentEntity: Entity, selectedHistoricalEntity: Entity | null, fields: string[])`, returning the same `{ previousVersion, selectedVersion }` shape `computeEntityDiff` already produces. Task 7's page composable calls this directly.

- [ ] **Step 1: Write the failing test**

```ts
// src/composables/__tests__/useHistoryFieldDiff.test.ts
import { describe, it, expect } from "vitest";
import { useHistoryFieldDiff } from "../useHistoryFieldDiff";

describe("useHistoryFieldDiff", () => {
  it("tags a field that differs between current and the selected historical version", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;
    const historical = { id: "hist-1", intialValues: { significance: "Low" } } as any;

    const result = useHistoryFieldDiff(current, historical, ["significance"]);

    expect(result.selectedVersion.intialValues.significance).toEqual({
      formatter: "pill|added",
      label: "High",
    });
    expect(result.previousVersion.intialValues.significance).toEqual({
      formatter: "pill|modified",
      label: "Low",
    });
  });

  it("leaves unchanged fields untouched", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;
    const historical = { id: "hist-1", intialValues: { significance: "High" } } as any;

    const result = useHistoryFieldDiff(current, historical, ["significance"]);

    expect(result.selectedVersion.intialValues.significance).toBe("High");
  });

  it("treats a missing historical version as nothing to diff against", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;

    const result = useHistoryFieldDiff(current, null, ["significance"]);

    expect(result.previousVersion).toEqual({});
    expect(result.selectedVersion.intialValues.significance).toBe("High");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/composables/__tests__/useHistoryFieldDiff.test.ts`
Expected: FAIL — `useHistoryFieldDiff` module does not exist.

- [ ] **Step 3: Hoist `computeEntityDiff` to module scope in `useEntityDiff.ts`**

Replace the contents of `src/composables/useEntityDiff.ts` with (only the declaration positions change — `formatDisplayValue` and `computeEntityDiff` move outside `useEntityDiff`, `export` added to `computeEntityDiff`; the body of every function is byte-for-byte the same as before):

```ts
import { computed, type Ref } from "vue";
import { dequal as isEqual } from "dequal";
import { getMetadataFields } from "@/helpers";
import type { Entity, WindowElementPanel } from "@/generated-types/queries";
import { deepToRaw } from "@/utils/deepToRaw";

interface DiffArgs {
  previousVersion: Entity | null | undefined;
  selectedVersion: Entity;
  fields: string[];
}

const formatDisplayValue = (val: any) => {
  if (val === "" || val === null || val === undefined) {
    return "";
  }
  return val;
};

export const computeEntityDiff = ({
  previousVersion,
  selectedVersion,
  fields,
}: DiffArgs) => {
  const cloneSelected = structuredClone(deepToRaw(selectedVersion)) as any;
  const selectedValues = cloneSelected?.intialValues || {};
  const processedSelected: Record<string, any> = {
    __typename: "IntialValues",
  };

  const clonePrevious = previousVersion
    ? (structuredClone(deepToRaw(previousVersion)) as any)
    : null;
  const previousValues = clonePrevious?.intialValues || {};
  const processedPrevious: Record<string, any> = {
    __typename: "IntialValues",
  };

  const canDiff = !!clonePrevious;

  fields.forEach((key) => {
    const currentVal = selectedValues[key]?.formatter
      ? selectedValues[key].label
      : selectedValues[key];
    const prevVal = previousValues[key]?.formatter
      ? previousValues[key].label
      : previousValues[key];

    const hasChanged = canDiff && !isEqual(currentVal, prevVal);

    if (hasChanged) {
      processedPrevious[key] = {
        formatter: "pill|modified",
        label: formatDisplayValue(prevVal),
      };
      processedSelected[key] = {
        formatter: "pill|added",
        label: formatDisplayValue(currentVal),
      };
    } else {
      processedPrevious[key] = prevVal;
      processedSelected[key] = currentVal;
    }
  });

  cloneSelected.intialValues = processedSelected;

  if (clonePrevious) {
    clonePrevious.intialValues = processedPrevious;
  }

  return {
    previousVersion: clonePrevious
      ? { ...clonePrevious, id: `${previousVersion!.id}_previous` }
      : {},
    selectedVersion: {
      ...cloneSelected,
      id: `${selectedVersion.id}_selected`,
    },
  };
};

export function useEntityDiff(
  props: {
    entity: Entity;
    entities: Entity[];
    entityId: string;
  },
  panels: Ref<any>,
) {
  const keysToCompare = computed(() => {
    if (!props.entity || !panels.value) return [];

    const fields = panels.value
      .map((panel: WindowElementPanel) =>
        getMetadataFields(panel, panel.panelType, props.entityId),
      )
      .flat();

    return fields.map((field: any) => field.key);
  });

  const diffedResults = computed(() => {
    if (!props.entity || !props.entities) return null;

    const selectedEntityIndex = props.entities.findIndex(
      (e) => e.id === props.entity.id,
    );

    if (selectedEntityIndex === -1) return null;
    const previousVersion = props.entities[selectedEntityIndex + 1];

    return computeEntityDiff({
      previousVersion: previousVersion,
      selectedVersion: props.entity,
      fields: keysToCompare.value,
    });
  });

  return {
    diffedResults,
    keysToCompare,
  };
}
```

- [ ] **Step 4: Run the existing `useEntityDiff` test suite to confirm no regression**

Run: `pnpm vitest run src/composables/__tests__/useEntityDiff.test.ts`
Expected: all existing tests still PASS unchanged.

- [ ] **Step 5: Write `useHistoryFieldDiff`**

```ts
// src/composables/useHistoryFieldDiff.ts
import { computeEntityDiff } from "@/composables/useEntityDiff";
import type { Entity } from "@/generated-types/queries";

export function useHistoryFieldDiff(
  currentEntity: Entity,
  selectedHistoricalEntity: Entity | null,
  fields: string[],
) {
  return computeEntityDiff({
    previousVersion: selectedHistoricalEntity,
    selectedVersion: currentEntity,
    fields,
  });
}
```

- [ ] **Step 6: Run the new test to verify it passes**

Run: `pnpm vitest run src/composables/__tests__/useHistoryFieldDiff.test.ts`
Expected: PASS (all 3 cases).

- [ ] **Step 7: Commit**

```bash
git add src/composables/useEntityDiff.ts src/composables/useHistoryFieldDiff.ts src/composables/__tests__/useHistoryFieldDiff.test.ts
git commit -m "feat: export computeEntityDiff and add useHistoryFieldDiff composable"
```

---

### Task 5: `useRelationListDiff` composable (`inuits-dams-pwa`)

**Files:**
- Create: `src/composables/useRelationListDiff.ts`
- Test: `src/composables/__tests__/useRelationListDiff.test.ts`

**Interfaces:**
- Produces: `useRelationListDiff(currentRelations: { key: string }[] | undefined, historicalRelations: { key: string }[] | undefined): { addedIds: string[]; removedIds: string[]; unchangedIds: string[] }`. Task 7's page composable calls this with each side's `entity.relationValues[relationType]` array.

- [ ] **Step 1: Write the failing test**

```ts
// src/composables/__tests__/useRelationListDiff.test.ts
import { describe, it, expect } from "vitest";
import { useRelationListDiff } from "../useRelationListDiff";

describe("useRelationListDiff", () => {
  it("classifies ids present only in the current version as added", () => {
    const result = useRelationListDiff(
      [{ key: "word-1" }, { key: "word-2" }],
      [{ key: "word-1" }],
    );
    expect(result.addedIds).toEqual(["word-2"]);
    expect(result.removedIds).toEqual([]);
    expect(result.unchangedIds).toEqual(["word-1"]);
  });

  it("classifies ids present only in the historical version as removed", () => {
    const result = useRelationListDiff(
      [{ key: "word-1" }],
      [{ key: "word-1" }, { key: "word-2" }],
    );
    expect(result.removedIds).toEqual(["word-2"]);
    expect(result.addedIds).toEqual([]);
    expect(result.unchangedIds).toEqual(["word-1"]);
  });

  it("handles missing relation arrays as empty", () => {
    const result = useRelationListDiff(undefined, undefined);
    expect(result).toEqual({ addedIds: [], removedIds: [], unchangedIds: [] });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/composables/__tests__/useRelationListDiff.test.ts`
Expected: FAIL — `useRelationListDiff` module does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// src/composables/useRelationListDiff.ts
export interface RelationDiffEntry {
  key: string;
}

export interface RelationListDiffResult {
  addedIds: string[];
  removedIds: string[];
  unchangedIds: string[];
}

export function useRelationListDiff(
  currentRelations: RelationDiffEntry[] | undefined,
  historicalRelations: RelationDiffEntry[] | undefined,
): RelationListDiffResult {
  const currentIds = new Set((currentRelations ?? []).map((r) => r.key));
  const historicalIds = new Set((historicalRelations ?? []).map((r) => r.key));

  return {
    addedIds: [...currentIds].filter((id) => !historicalIds.has(id)),
    removedIds: [...historicalIds].filter((id) => !currentIds.has(id)),
    unchangedIds: [...currentIds].filter((id) => historicalIds.has(id)),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/composables/__tests__/useRelationListDiff.test.ts`
Expected: PASS (all 3 cases).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useRelationListDiff.ts src/composables/__tests__/useRelationListDiff.test.ts
git commit -m "feat: add useRelationListDiff composable"
```

---

### Task 6: `RelationDiffList.vue` component (`inuits-dams-pwa`)

**Files:**
- Create: `src/components/history/RelationDiffList.vue`
- Test: `src/components/history/tests/RelationDiffList.test.ts`

**Interfaces:**
- Consumes props: `items: { key: string; label: string; status: "added" | "removed" | "unchanged" }[]`.
- Produces: a rendered list of chips, one per item, styled by `status`. Task 7's page component renders this directly, feeding it the array built from Task 1's resolver output + Task 5's id classification.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/history/tests/RelationDiffList.test.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import RelationDiffList from "../RelationDiffList.vue";

describe("RelationDiffList", () => {
  it("renders one chip per item with its label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "word-1", label: "Amun", status: "unchanged" },
          { key: "word-2", label: "Ra", status: "added" },
        ],
      },
    });
    expect(wrapper.text()).toContain("Amun");
    expect(wrapper.text()).toContain("Ra");
    expect(wrapper.findAll("span")).toHaveLength(2);
  });

  it("applies the removed styling to removed items", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "Amun", status: "removed" }],
      },
    });
    expect(wrapper.find("span").classes()).toContain("line-through");
    expect(wrapper.find("span").classes()).toContain("bg-red-100");
  });

  it("applies the added styling to added items", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-2", label: "Ra", status: "added" }],
      },
    });
    expect(wrapper.find("span").classes()).toContain("bg-green-100");
  });

  it("renders nothing when items is empty", () => {
    const wrapper = mount(RelationDiffList, { props: { items: [] } });
    expect(wrapper.findAll("span")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/history/tests/RelationDiffList.test.ts`
Expected: FAIL — component file does not exist.

- [ ] **Step 3: Write the component**

```vue
<!-- src/components/history/RelationDiffList.vue -->
<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in items"
      :key="item.key"
      :class="[
        'rounded-full px-2 py-1 text-sm',
        {
          'bg-green-100 text-green-800': item.status === 'added',
          'bg-red-100 text-red-800 line-through': item.status === 'removed',
          'bg-gray-100 text-gray-800': item.status === 'unchanged',
        },
      ]"
    >
      {{ item.label }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  items: { key: string; label: string; status: "added" | "removed" | "unchanged" }[];
}>();
</script>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/history/tests/RelationDiffList.test.ts`
Expected: PASS (all 4 cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/history/RelationDiffList.vue src/components/history/tests/RelationDiffList.test.ts
git commit -m "feat: add RelationDiffList component"
```

---

### Task 7: Page composable, page component, router wiring, entry point (`inuits-dams-pwa`)

**Files:**
- Create: `src/composables/useHistoryComparisonData.ts`
- Create: `src/views/HistoryComparison.vue`
- Modify: `src/views/router.ts` (register the `HistoryComparison` route component)
- Modify: `src/views/EntitySingle.vue` (add a "History" entry-point link)

**Interfaces:**
- Consumes: `useHistoryFieldDiff` (Task 4), `useRelationListDiff` (Task 5), `RelationDiffList.vue` (Task 6), `GetInscriptionHistoryDocument`/`GetRelationLabelsForIdsDocument` (Task 2, available after `task generate`), `GetEntityByIdDocument` (already exists).
- Route name `HistoryComparison` must match the `name`/`component` string registered in Task 3's `aicapRoutes.ts` entry exactly.

This task is primarily wiring — per this project's convention (e.g. `useMenuHelper.ts`, another `useQuery`-based composable, has no dedicated unit test), it is verified by manually exercising the page in the running app rather than a mocked-Apollo unit test.

- [ ] **Step 1: Write the page composable**

```ts
// src/composables/useHistoryComparisonData.ts
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
  type Entity,
} from "@/generated-types/queries";
import {
  GetInscriptionHistoryDocument,
  type GetInscriptionHistoryQuery,
  GetRelationLabelsForIdsDocument,
  type GetRelationLabelsForIdsQuery,
} from "@/generated-types/queries";
import { useHistoryFieldDiff } from "@/composables/useHistoryFieldDiff";
import { useRelationListDiff } from "@/composables/useRelationListDiff";

const SCALAR_COMPARISON_FIELDS = ["significance", "refLanguage", "refScript"];
const RELATION_LIST_TYPE = "refWords";
const RELATION_LIST_ENTITY_TYPE = "word";
const RELATION_LIST_LABEL_KEY = "name";

export function useHistoryComparisonData(entityId: string, entityType: string) {
  const selectedVersionId = ref<string | null>(null);

  const { result: currentResult } = useQuery<
    GetEntityByIdQuery,
    GetEntityByIdQueryVariables
  >(GetEntityByIdDocument, { id: entityId, type: entityType });
  const currentEntity = computed(
    () => currentResult.value?.Entity as Entity | undefined,
  );

  const { result: historyResult } = useQuery<GetInscriptionHistoryQuery>(
    GetInscriptionHistoryDocument,
    {
      limit: 1000,
      skip: 1,
      advancedFilterInputs: [
        { type: "type", value: entityType },
        {
          type: "selection",
          key: ["aicap:1|id"],
          value: entityId,
          match_exact: true,
        },
      ],
    },
  );

  const historyVersions = computed(() => {
    const rows: any[] = historyResult.value?.EntitiesHistory?.results ?? [];
    return [...rows].sort(
      (a, b) =>
        new Date(a.intialValues.date_updated).getTime() -
        new Date(b.intialValues.date_updated).getTime(),
    );
  });

  const versionOptions = computed(() =>
    historyVersions.value.map((version, index) => ({
      id: version.id,
      label: `Version ${index + 1}`,
      date: version.intialValues.date_updated,
    })),
  );

  watch(
    versionOptions,
    (options) => {
      if (!selectedVersionId.value && options.length > 0) {
        selectedVersionId.value = options[options.length - 1].id;
      }
    },
    { immediate: true },
  );

  const selectedVersion = computed(
    () =>
      historyVersions.value.find((v) => v.id === selectedVersionId.value) ??
      null,
  );

  const scalarDiff = computed(() => {
    if (!currentEntity.value) return null;
    return useHistoryFieldDiff(
      currentEntity.value,
      selectedVersion.value,
      SCALAR_COMPARISON_FIELDS,
    );
  });

  const relationListDiff = computed(() =>
    useRelationListDiff(
      currentEntity.value?.relationValues?.[RELATION_LIST_TYPE],
      selectedVersion.value?.relationValues?.[RELATION_LIST_TYPE],
    ),
  );

  const relationIdsToLabel = computed(() => [
    ...relationListDiff.value.addedIds,
    ...relationListDiff.value.removedIds,
    ...relationListDiff.value.unchangedIds,
  ]);

  const { result: labelsResult } = useQuery<GetRelationLabelsForIdsQuery>(
    GetRelationLabelsForIdsDocument,
    () => ({
      ids: relationIdsToLabel.value,
      type: RELATION_LIST_ENTITY_TYPE,
      metadataKeyAsLabel: RELATION_LIST_LABEL_KEY,
    }),
    () => ({ enabled: relationIdsToLabel.value.length > 0 }),
  );

  const relationDiffItems = computed(() => {
    const labels = labelsResult.value?.RelationLabelsForIds ?? [];
    const labelFor = (id: string) =>
      labels.find((l) => l.key === id)?.value ?? id;

    return [
      ...relationListDiff.value.addedIds.map((id) => ({
        key: id,
        label: labelFor(id),
        status: "added" as const,
      })),
      ...relationListDiff.value.removedIds.map((id) => ({
        key: id,
        label: labelFor(id),
        status: "removed" as const,
      })),
      ...relationListDiff.value.unchangedIds.map((id) => ({
        key: id,
        label: labelFor(id),
        status: "unchanged" as const,
      })),
    ];
  });

  return {
    currentEntity,
    versionOptions,
    selectedVersionId,
    scalarDiff,
    relationDiffItems,
  };
}
```

- [ ] **Step 2: Write the page component**

```vue
<!-- src/views/HistoryComparison.vue -->
<template>
  <div class="h-full w-full flex flex-col gap-4 p-4">
    <div class="flex items-center gap-2">
      <label for="version-select">{{ $t("history.select-version") }}</label>
      <select id="version-select" v-model="selectedVersionId">
        <option
          v-for="option in versionOptions"
          :key="option.id"
          :value="option.id"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
      <div>
        <h2 class="font-semibold mb-2">{{ $t("history.current-version") }}</h2>
        <div v-for="field in scalarComparisonFields" :key="field" class="mb-1">
          <span class="font-medium">{{ field }}:</span>
          <metadata-formatter-pill
            v-if="scalarDiff?.selectedVersion.intialValues[field]?.formatter"
            :formatter="scalarDiff.selectedVersion.intialValues[field].formatter"
            :label="scalarDiff.selectedVersion.intialValues[field].label"
          />
          <span v-else>{{ scalarDiff?.selectedVersion.intialValues[field] }}</span>
        </div>
        <relation-diff-list :items="relationDiffItems" />
      </div>

      <div>
        <h2 class="font-semibold mb-2">{{ selectedVersionLabel }}</h2>
        <div v-for="field in scalarComparisonFields" :key="field" class="mb-1">
          <span class="font-medium">{{ field }}:</span>
          <metadata-formatter-pill
            v-if="scalarDiff?.previousVersion?.intialValues?.[field]?.formatter"
            :formatter="scalarDiff.previousVersion.intialValues[field].formatter"
            :label="scalarDiff.previousVersion.intialValues[field].label"
          />
          <span v-else>{{ scalarDiff?.previousVersion?.intialValues?.[field] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import MetadataFormatterPill from "@/components/metadata/MetadataFormatterPill.vue";
import RelationDiffList from "@/components/history/RelationDiffList.vue";
import { useHistoryComparisonData } from "@/composables/useHistoryComparisonData";

const route = useRoute();
const entityId = route.params.id as string;
const entityType = route.params.type as string;

const scalarComparisonFields = ["significance", "refLanguage", "refScript"];

const { versionOptions, selectedVersionId, scalarDiff, relationDiffItems } =
  useHistoryComparisonData(entityId, entityType);

const selectedVersionLabel = computed(
  () =>
    versionOptions.value.find(
      (option) => option.id === selectedVersionId.value,
    )?.label ?? "",
);
</script>
```

- [ ] **Step 3: Register the route component**

In `src/views/router.ts`, add to `routeComponentConfig` (next to `SingleEntity`):

```ts
  {
    routeName: "HistoryComparison",
    routeComponent: () => import("@/views/HistoryComparison.vue"),
  },
```

- [ ] **Step 4: Add the entry-point link on the entity detail page**

In `src/views/EntitySingle.vue`'s template, add a link immediately before the `<entity-column>` element:

```vue
        <router-link
          v-if="entity"
          :to="{ name: 'HistoryComparison', params: { type: entityType, id: entity.id } }"
          class="inline-block mb-2 text-accent underline"
        >
          {{ $t("history.view-history") }}
        </router-link>
        <entity-column
```

- [ ] **Step 5: Regenerate types**

Run: `task generate`
Expected: `GetInscriptionHistoryDocument`, `GetRelationLabelsForIdsDocument`, and their `Query`/`QueryVariables` types are now present in `src/generated-types/queries.ts`. If TypeScript errors appear in `useHistoryComparisonData.ts` about missing exports, re-run after confirming Task 2 was committed and picked up.

- [ ] **Step 6: Manually verify against the running `ugent-aicap` environment**

The `ugent-aicap` docker containers are already running locally. Start/refresh the dashboard container if needed (`task start-client` or restart the `inuits-elody-ugent-aicap-dashboard-1` container), then:
1. Open an inscription's detail page in the browser.
2. Confirm the new "History" link appears and navigates to `/inscription/<id>/history`.
3. Confirm the version dropdown is populated (or shows "no history yet" if this particular inscription has no history entries — in that case, edit the inscription once via the UI to generate a history entry, then retry).
4. Pick a version and confirm the left/right columns show the expected fields, with changed scalar/single-relation fields rendered as pills, and the `refWords` relation rendered as a chip list with added/removed/unchanged coloring.
5. If `advancedFilterInputs` doesn't correctly scope to one entity (e.g. the dropdown shows other entities' history), double check the `aicap:1|id` filter key against Task 2's query — this was the one open item flagged in the design spec as needing live verification.

- [ ] **Step 7: Commit**

```bash
git add src/composables/useHistoryComparisonData.ts src/views/HistoryComparison.vue src/views/router.ts src/views/EntitySingle.vue
git commit -m "feat: add history comparison page for inscription POC"
```
