import {
  computed,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
} from "vue";
import { useQuery } from "@vue/apollo-composable";
import { dequal as isEqual } from "dequal";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import type { DocumentNode } from "graphql";
import {
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
  type Entity,
} from "@/generated-types/queries";
import {
  findEntityListElement,
  findPanelMetadata,
  findWysiwygElement,
  convertDateToReadbleFormat,
} from "@/helpers";
import { useImport } from "@/composables/useImport";
import { useHistoryFieldDiff } from "@/composables/useHistoryFieldDiff";
import {
  useRelationListDiff,
  type RelationListDiffResult,
} from "@/composables/useRelationListDiff";

const RELATION_TYPE_CONFIG: Record<
  string,
  { entityType: string; metadataKeyAsLabel?: string; rootKeyAsLabel?: string }
> = {
  refWords: { entityType: "word", metadataKeyAsLabel: "original_word" },
  refMultilingualCounterparts: {
    entityType: "inscription",
    rootKeyAsLabel: "id",
  },
  refMediafiles: {
    entityType: "mediafile",
    rootKeyAsLabel: "original_filename",
  },
};

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
  const { loadDocument } = useImport();

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

  const historyDocument = shallowRef<DocumentNode | null>(null);
  const relationLabelsDocument = shallowRef<DocumentNode | null>(null);
  const documentsLoaded = ref<boolean>(false);

  const loadDocuments = async () => {
    historyDocument.value = (await loadDocument("GetHistoryEntities")) ?? null;
    relationLabelsDocument.value =
      (await loadDocument("GetRelationLabelsForIds")) ?? null;
    documentsLoaded.value = true;
  };
  loadDocuments();

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

  const { result: historyResult, loading: historyLoading } = useQuery<any>(
    historyDocument,
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

  const historyVersions = computed<HistoryVersionRow[]>(() =>
    sortHistoryVersionsByDate(
      (historyResult.value?.EntitiesHistory?.results ??
        []) as HistoryVersionRow[],
    ),
  );

  const versionOptions = computed<VersionOption[]>(() =>
    buildVersionOptions(
      (historyResult.value?.EntitiesHistory?.results ??
        []) as HistoryVersionRow[],
    ),
  );

  const loading = computed(
    () => !documentsLoaded.value || historyLoading.value,
  );

  watch(
    versionOptions,
    (options) => {
      if (!rightVersionId.value && options.length > 0) {
        rightVersionId.value = options[options.length - 1].id;
      }
    },
    { immediate: true },
  );

  const resolveVersion = (id: string | null): any =>
    id === LIVE_VERSION_ID
      ? (currentEntity.value ?? null)
      : (historyVersions.value.find((v) => v.id === id) ?? null);

  const leftVersion = computed<any>(() => resolveVersion(leftVersionId.value));
  const rightVersion = computed<any>(() =>
    resolveVersion(rightVersionId.value),
  );

  const isVersionLoading = (id: string | null): boolean =>
    id === LIVE_VERSION_ID ? currentEntityLoading.value : loading.value;

  const leftLoading = computed(
    () => isVersionLoading(leftVersionId.value) || relationLabelsLoading.value,
  );
  const rightLoading = computed(
    () => isVersionLoading(rightVersionId.value) || relationLabelsLoading.value,
  );

  const scalarComparisonFields = computed<string[]>(() =>
    findPanelMetadata(leftVersion.value?.entityView).map(
      (field: any) => field.key,
    ),
  );

  const scalarDiff = computed(() => {
    if (!leftVersion.value) return null;
    return useHistoryFieldDiff(
      leftVersion.value,
      rightVersion.value,
      scalarComparisonFields.value,
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

  const relationListDiffs = computed<Record<string, RelationListDiffResult>>(
    () =>
      Object.fromEntries(
        Object.keys(RELATION_TYPE_CONFIG).map((relationType) => [
          relationType,
          useRelationListDiff(
            leftVersion.value?.relationValues?.[relationType],
            rightVersion.value?.relationValues?.[relationType],
          ),
        ]),
      ),
  );

  const idsToLabel = (relationType: string): string[] => {
    const diff = relationListDiffs.value[relationType];
    if (!diff) return [];
    return [...diff.addedIds, ...diff.removedIds, ...diff.unchangedIds];
  };

  const relationLabels: Record<
    string,
    ComputedRef<{ key: string; value: string }[]>
  > = {};
  const relationLabelsLoadingFlags: ComputedRef<boolean>[] = [];

  Object.entries(RELATION_TYPE_CONFIG).forEach(([relationType, config]) => {
    const ids = computed<string[]>(() => idsToLabel(relationType));

    const { result, loading: relationLabelLoading } = useQuery<any>(
      relationLabelsDocument,
      () => ({
        ids: ids.value,
        type: config.entityType,
        metadataKeyAsLabel: config.metadataKeyAsLabel ?? null,
        rootKeyAsLabel: config.rootKeyAsLabel ?? null,
      }),
      () => ({ enabled: ids.value.length > 0 }),
    );

    relationLabels[relationType] = computed(
      () => result.value?.RelationLabelsForIds ?? [],
    );
    relationLabelsLoadingFlags.push(relationLabelLoading);
  });

  const relationLabelsLoading = computed(() =>
    relationLabelsLoadingFlags.some((flag) => flag.value),
  );

  const relationDiffs = computed<RelationDiff[]>(() =>
    findEntityListElement(leftVersion.value?.entityView)
      .map((panel: any): RelationDiff | null => {
        const config = RELATION_TYPE_CONFIG[panel.relationType];
        if (!config) return null;

        const diff = relationListDiffs.value[panel.relationType];
        const labels = relationLabels[panel.relationType]?.value ?? [];
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
      })
      .filter((diff): diff is RelationDiff => diff !== null),
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
    leftWysiwygDiffs,
    rightWysiwygDiffs,
    relationDiffs,
    leftRelationDiffs,
    rightRelationDiffs,
    loading,
  };
}
