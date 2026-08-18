import { computed, onUnmounted, ref, watch, type Ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { dequal as isEqual } from "dequal";
import { apolloClient } from "@/main";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import { useEntityHistoryVersions } from "@/composables/useEntityHistoryVersions";
import {
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
  GetEntityHistoryVersionDetailDocument,
  type GetEntityHistoryVersionDetailQuery,
  type GetEntityHistoryVersionDetailQueryVariables,
  type Entity,
} from "@/generated-types/queries";
import {
  findEntityListElement,
  findPanelMetadata,
  findRepeatablePanelFields,
  findWysiwygElement,
  convertDateToReadbleFormat,
  getEntityTitle,
} from "@/helpers";
import { useHistoryFieldDiff } from "@/composables/useHistoryFieldDiff";
import {
  useRelationListDiff,
  type RelationListDiffResult,
} from "@/composables/useRelationListDiff";

export type RelationDiffItem = {
  key: string;
  label: string;
  status: "added" | "removed" | "unchanged";
};

export type RelationDiff = {
  relationType: string;
  label: string;
  items: RelationDiffItem[];
};

export type WysiwygDiff = {
  key: string;
  label: string;
  changed: boolean;
  colorVariant: "current" | "previous";
};

export type HistoryVersionRow = {
  id: string;
  intialValues: { updated_at?: any };
  [key: string]: any;
};

export type VersionOption = {
  id: string;
  label: string;
  date: any;
};

export const LIVE_VERSION_ID = "__live__";

export const hasRelationDiff = (
  relationDiffs: RelationDiff[],
  element: { relationType?: string | null },
): boolean =>
  relationDiffs.some((diff) => diff.relationType === element.relationType);

export const relationDiffItemsFor = (
  relationDiffs: RelationDiff[],
  element: { relationType?: string | null },
): RelationDiffItem[] =>
  relationDiffs.find((diff) => diff.relationType === element.relationType)
    ?.items ?? [];

const toTimestamp = (value: any): number => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortHistoryVersionsByDate = <T extends HistoryVersionRow>(
  historyRows: T[],
): T[] =>
  [...(historyRows ?? [])].sort(
    (a, b) =>
      toTimestamp(a?.intialValues?.updated_at) -
      toTimestamp(b?.intialValues?.updated_at),
  );

export const buildVersionOptions = (
  historyRows: HistoryVersionRow[],
): VersionOption[] =>
  sortHistoryVersionsByDate(historyRows).map((version, index) => {
    const date = version?.intialValues?.updated_at;
    const label = date
      ? `Version ${index + 1} (${convertDateToReadbleFormat(date, "DEFAULT", true)})`
      : `Version ${index + 1}`;
    return { id: version.id, label, date };
  });

export function useHistoryComparisonData(entityId: string, entityType: string) {
  const leftVersionId = ref<string | null>(LIVE_VERSION_ID);
  const rightVersionId = ref<string | null>(null);

  const previousEntityUuid = useEntitySingle().getEntityUuid();
  const previousEntityType = useEntitySingle().getEntityType();
  useEntitySingle().setEntityUuid(entityId);
  useEntitySingle().setEntityType(entityType);

  const currentEntityEditState = useEditMode(entityId);
  const wasEditingCurrentEntity = currentEntityEditState.isEdit;
  currentEntityEditState.isEdit = false;

  onUnmounted(() => {
    useEntitySingle().setEntityUuid(previousEntityUuid ?? "");
    useEntitySingle().setEntityType(previousEntityType ?? "");
    currentEntityEditState.isEdit = wasEditingCurrentEntity;
  });

  const { result: currentResult, loading: currentEntityLoading } = useQuery<
    GetEntityByIdQuery,
    GetEntityByIdQueryVariables
  >(
    GetEntityByIdDocument,
    { id: entityId, type: entityType },
    () => ({ fetchPolicy: "no-cache" }),
  );
  const currentEntity = computed(
    () => currentResult.value?.Entity as Entity | undefined,
  );

  // Lightweight version metadata only (no entityView/intialValues/relationValues) —
  // replaces bulk-fetching every historical snapshot just to populate the picker.
  const { versions, loading: versionsLoading } = useEntityHistoryVersions(
    entityId,
    entityType,
  );

  const historyVersionRows = computed<HistoryVersionRow[]>(() =>
    versions.value.map((version) => ({
      id: version.versionId,
      intialValues: { updated_at: version.timestamp },
    })),
  );

  const versionOptions = computed<VersionOption[]>(() =>
    buildVersionOptions(historyVersionRows.value),
  );

  const loading = versionsLoading;

  watch(
    versionOptions,
    (options) => {
      if (!rightVersionId.value && options.length > 0) {
        rightVersionId.value = options[options.length - 1].id;
      }
    },
    { immediate: true },
  );

  // Full entity content (entityView/intialValues/relationValues) for exactly the
  // version a side is showing, fetched on demand instead of pulled in bulk — one
  // query per side, since left/right can independently show different versions.
  const useVersionDetail = (versionId: Ref<string | null>) => {
    const variables = computed(() => ({
      id: entityId,
      type: entityType,
      versionId: versionId.value ?? "",
    }));
    return useQuery<
      GetEntityHistoryVersionDetailQuery,
      GetEntityHistoryVersionDetailQueryVariables
    >(GetEntityHistoryVersionDetailDocument, variables, () => ({
      enabled: versionId.value !== null && versionId.value !== LIVE_VERSION_ID,
    }));
  };

  const { result: leftDetailResult, loading: leftDetailLoading } =
    useVersionDetail(leftVersionId);
  const { result: rightDetailResult, loading: rightDetailLoading } =
    useVersionDetail(rightVersionId);

  const resolveVersion = (
    id: string | null,
    detailResult: Ref<GetEntityHistoryVersionDetailQuery | undefined>,
  ): any =>
    id === LIVE_VERSION_ID
      ? (currentEntity.value ?? null)
      : (detailResult.value?.EntityHistoryVersionDetail ?? null);

  const leftVersion = computed<any>(() =>
    resolveVersion(leftVersionId.value, leftDetailResult),
  );
  const rightVersion = computed<any>(() =>
    resolveVersion(rightVersionId.value, rightDetailResult),
  );

  const isVersionLoading = (
    id: string | null,
    detailLoading: Ref<boolean>,
  ): boolean =>
    id === LIVE_VERSION_ID ? currentEntityLoading.value : detailLoading.value;

  const leftLoading = computed(
    () =>
      isVersionLoading(leftVersionId.value, leftDetailLoading) ||
      relationLabelsLoading.value,
  );
  const rightLoading = computed(
    () =>
      isVersionLoading(rightVersionId.value, rightDetailLoading) ||
      relationLabelsLoading.value,
  );

  const scalarComparisonFields = computed<string[]>(() =>
    findPanelMetadata(leftVersion.value?.entityView).map(
      (field: any) => field.key,
    ),
  );

  const repeatableComparisonFields = computed(() =>
    findRepeatablePanelFields(leftVersion.value?.entityView),
  );

  const scalarDiff = computed(() => {
    if (!leftVersion.value) return null;
    return useHistoryFieldDiff(
      leftVersion.value,
      rightVersion.value,
      scalarComparisonFields.value,
      repeatableComparisonFields.value,
    );
  });

  const withDiffedIntialValues = (
    base: { intialValues?: Record<string, any> | null } | null | undefined,
    diffed: Record<string, any>,
  ) => ({
    ...diffed,
    intialValues: {
      ...(base?.intialValues ?? {}),
      ...(diffed.intialValues ?? {}),
    },
  });

  const leftVersionEntity = computed<Record<string, any> | null>(() => {
    const diffed = scalarDiff.value?.selectedVersion;
    if (!diffed) return null;
    return withDiffedIntialValues(leftVersion.value, diffed);
  });

  const rightVersionEntity = computed<Record<string, any> | null>(() => {
    const diffed = scalarDiff.value?.previousVersion as Record<string, any>;
    if (!diffed || Object.keys(diffed).length === 0) return null;
    return withDiffedIntialValues(rightVersion.value, diffed);
  });

  // The backend can assemble entityView's nested field maps in a different
  // order for a historical snapshot than for the live entity (confirmed: the
  // divergence is already present the moment Apollo delivers the response,
  // before any frontend processing). A side-by-side diff view can't rely on
  // each side's own object key order, so both sides render using one
  // canonical order anchored on the left/current side, with any keys unique
  // to the right side appended at the end.
  const orderKeysByReference = (
    reference: Record<string, any> | undefined,
    other: Record<string, any> | undefined,
  ): string[] => {
    const referenceKeys = Object.keys(reference ?? {});
    const extraKeys = Object.keys(other ?? {}).filter(
      (key) => !referenceKeys.includes(key),
    );
    return [...referenceKeys, ...extraKeys];
  };

  const columnOrder = computed<string[]>(() =>
    orderKeysByReference(
      leftVersionEntity.value?.entityView,
      rightVersionEntity.value?.entityView,
    ),
  );

  const elementOrderByColumn = computed<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    columnOrder.value.forEach((columnKey) => {
      result[columnKey] = orderKeysByReference(
        leftVersionEntity.value?.entityView?.[columnKey]?.elements,
        rightVersionEntity.value?.entityView?.[columnKey]?.elements,
      );
    });
    return result;
  });

  const wysiwygFieldChanges = computed<Omit<WysiwygDiff, "colorVariant">[]>(
    () => {
      const canDiff = !!rightVersion.value;
      return findWysiwygElement(leftVersion.value?.entityView).map(
        (field: any) => ({
          key: field.metadataKey,
          label: field.label,
          changed:
            canDiff &&
            !isEqual(
              leftVersion.value?.intialValues?.[field.metadataKey],
              rightVersion.value?.intialValues?.[field.metadataKey],
            ),
        }),
      );
    },
  );

  const leftWysiwygDiffs = computed<WysiwygDiff[]>(() =>
    wysiwygFieldChanges.value.map((diff) => ({
      ...diff,
      colorVariant: "current",
    })),
  );

  const rightWysiwygDiffs = computed<WysiwygDiff[]>(() =>
    wysiwygFieldChanges.value.map((diff) => ({
      ...diff,
      colorVariant: "previous",
    })),
  );

  const relationPanels = computed<any[]>(() =>
    findEntityListElement(leftVersion.value?.entityView),
  );

  const relationListDiffs = computed<Record<string, RelationListDiffResult>>(
    () =>
      Object.fromEntries(
        relationPanels.value.map((panel) => [
          panel.relationType,
          useRelationListDiff(
            leftVersion.value?.relationValues?.[panel.relationType],
            rightVersion.value?.relationValues?.[panel.relationType],
          ),
        ]),
      ),
  );

  const idsToLabel = (relationType: string): string[] => {
    const diff = relationListDiffs.value[relationType];
    if (!diff) return [];
    return [...diff.addedIds, ...diff.removedIds, ...diff.unchangedIds];
  };

  // Which relation types need a label lookup right now, and against which
  // entity type. Derived from the panels actually present in the entityView,
  // so it covers any relation type for any client/entity type — not just a
  // hardcoded list. A panel without a resolvable entityType (or with nothing
  // to label yet) is skipped; its items simply fall back to the raw id.
  const relationLabelQueries = computed(() =>
    relationPanels.value
      .map((panel) => ({
        relationType: panel.relationType as string,
        entityType: panel.entityTypes?.[0] ?? null,
        ids: idsToLabel(panel.relationType),
      }))
      .filter((query) => query.entityType && query.ids.length > 0),
  );

  const relationLabels = ref<Record<string, { key: string; value: string }[]>>(
    {},
  );
  const relationLabelsLoading = ref(false);

  // Titles related entities the same way the live entity picker/list UI
  // already does (BaseLibrary.vue), via the generic getEntityTitle helper
  // over the same GetEntityById query used for the current entity above —
  // no per-relation-type or per-client label configuration needed.
  watch(
    relationLabelQueries,
    async (queries) => {
      if (queries.length === 0) return;

      relationLabelsLoading.value = true;
      await Promise.all(
        queries.map(async (query) => {
          const labels = await Promise.all(
            query.ids.map(async (id) => {
              try {
                const { data } = await apolloClient.query<
                  GetEntityByIdQuery,
                  GetEntityByIdQueryVariables
                >({
                  query: GetEntityByIdDocument,
                  variables: { id, type: query.entityType as any },
                  fetchPolicy: "no-cache",
                });
                const entity = data?.Entity as Entity | undefined;
                return { key: id, value: entity ? getEntityTitle(entity as any) : id };
              } catch {
                return { key: id, value: id };
              }
            }),
          );
          relationLabels.value[query.relationType] = labels;
        }),
      );
      relationLabelsLoading.value = false;
    },
    { immediate: true },
  );

  const relationDiffs = computed<RelationDiff[]>(() =>
    relationPanels.value.map((panel): RelationDiff => {
      const diff = relationListDiffs.value[panel.relationType];
      const labels = relationLabels.value[panel.relationType] ?? [];
      const labelFor = (id: string) =>
        labels.find((label) => label.key === id)?.value ?? id;

      const itemsFor = (ids: string[], status: RelationDiffItem["status"]) =>
        ids.map((id) => ({ key: id, label: labelFor(id), status }));

      return {
        relationType: panel.relationType,
        label: panel.label,
        items: [
          ...itemsFor(diff.addedIds, "added"),
          ...itemsFor(diff.removedIds, "removed"),
          ...itemsFor(diff.unchangedIds, "unchanged"),
        ],
      };
    }),
  );

  const leftRelationDiffs = computed<RelationDiff[]>(() =>
    relationDiffs.value.map((diff) => ({
      ...diff,
      items: diff.items.filter((item) => item.status !== "removed"),
    })),
  );

  const rightRelationDiffs = computed<RelationDiff[]>(() =>
    relationDiffs.value.map((diff) => ({
      ...diff,
      items: diff.items.filter((item) => item.status !== "added"),
    })),
  );

  return {
    currentEntity,
    versionOptions,
    leftVersionId,
    rightVersionId,
    leftLoading,
    rightLoading,
    leftVersionEntity,
    rightVersionEntity,
    columnOrder,
    elementOrderByColumn,
    leftWysiwygDiffs,
    rightWysiwygDiffs,
    relationDiffs,
    leftRelationDiffs,
    rightRelationDiffs,
    loading,
  };
}
