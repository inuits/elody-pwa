import { computed, onUnmounted, ref, watch, type Ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";
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
  status: "added" | "removed" | "unchanged" | "renamed";
  variant?: "current" | "previous";
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
  editedBy?: string | null;
  [key: string]: any;
};

export type VersionOption = {
  id: string;
  label: string;
  date: any;
  editedBy?: string | null;
};

export type VersionMeta = {
  editedBy: string | null;
  date: string | null;
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

export type VersionLabelFormatter = (
  number: number,
  readableDate?: string,
) => string;

export const buildVersionOptions = (
  historyRows: HistoryVersionRow[],
  formatLabel: VersionLabelFormatter,
): VersionOption[] =>
  sortHistoryVersionsByDate(historyRows).map((version, index) => {
    const date = version?.intialValues?.updated_at;
    const label = formatLabel(
      index + 1,
      date ? convertDateToReadbleFormat(date, "DEFAULT", true) : undefined,
    );
    return { id: version.id, label, date, editedBy: version.editedBy };
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
  const { t } = useI18n();
  const formatVersionLabel: VersionLabelFormatter = (number, readableDate) =>
    readableDate
      ? t("history.version-label", { number, date: readableDate })
      : t("history.version-label-undated", { number });

  const {
    versions,
    loading: versionsLoading,
    error: versionsError,
  } = useEntityHistoryVersions(
    entityId,
    entityType,
  );

  const historyVersionRows = computed<HistoryVersionRow[]>(() =>
    versions.value.map((version) => ({
      id: version.versionId,
      intialValues: { updated_at: version.timestamp },
      editedBy: version.editedBy,
    })),
  );

  const versionOptions = computed<VersionOption[]>(() =>
    buildVersionOptions(historyVersionRows.value, formatVersionLabel),
  );

  const loading = versionsLoading;

  const hasNoHistory = computed(
    () =>
      !versionsLoading.value &&
      !versionsError.value &&
      versionOptions.value.length === 0,
  );

  const versionMetaFor = (versionId: string | null): VersionMeta | null => {
    const options = versionOptions.value;
    const option =
      versionId === LIVE_VERSION_ID
        ? options[options.length - 1]
        : options.find((candidate) => candidate.id === versionId);
    if (!option) return null;
    return {
      editedBy: option.editedBy ?? null,
      date: option.date
        ? convertDateToReadbleFormat(option.date, "DEFAULT", true)
        : null,
    };
  };

  const leftVersionMeta = computed(() => versionMetaFor(leftVersionId.value));
  const rightVersionMeta = computed(() =>
    versionMetaFor(rightVersionId.value),
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
      fetchPolicy: "no-cache",
    }));
  };

  const {
    result: leftDetailResult,
    loading: leftDetailLoading,
    error: leftDetailError,
  } =
    useVersionDetail(leftVersionId);
  const {
    result: rightDetailResult,
    loading: rightDetailLoading,
    error: rightDetailError,
  } =
    useVersionDetail(rightVersionId);

  const leftVersionError = computed(
    () => leftVersionId.value !== LIVE_VERSION_ID && !!leftDetailError.value,
  );
  const rightVersionError = computed(
    () => rightVersionId.value !== LIVE_VERSION_ID && !!rightDetailError.value,
  );

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
    return {
      ...withDiffedIntialValues(leftVersion.value, diffed),
      id: `${diffed.id}-${leftVersionId.value}`,
    };
  });

  const rightVersionEntity = computed<Record<string, any> | null>(() => {
    const diffed = scalarDiff.value?.previousVersion as Record<string, any>;
    if (!diffed || Object.keys(diffed).length === 0) return null;
    return {
      ...withDiffedIntialValues(rightVersion.value, diffed),
      id: `${diffed.id}-${rightVersionId.value}`,
    };
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

  type LabelRequest = {
    cacheKey: string;
    liveCacheKey: string;
    id: string;
    entityType: string;
    versionId: string | null;
  };

  const liveCacheKeyFor = (entityType: string, id: string) =>
    `${entityType}|${id}|${LIVE_VERSION_ID}`;

  const labelRequestsFor = (
    version: any,
    versionId: string | null,
  ): Record<string, LabelRequest[]> =>
    Object.fromEntries(
      relationPanels.value
        .filter((panel) => panel.entityTypes?.[0])
        .map((panel) => {
          const entityType = panel.entityTypes[0] as string;
          const relations: any[] =
            version?.relationValues?.[panel.relationType] ?? [];
          const requests = relations
            .filter((relation) => relation?.key)
            .map((relation): LabelRequest => {
              const isHistorical =
                versionId !== null &&
                versionId !== LIVE_VERSION_ID &&
                !!relation.historyKey &&
                relation.historyKey !== relation.key;
              const liveCacheKey = liveCacheKeyFor(entityType, relation.key);
              return {
                cacheKey: isHistorical
                  ? `${entityType}|${relation.key}|${versionId}`
                  : liveCacheKey,
                liveCacheKey,
                id: relation.key,
                entityType,
                versionId: isHistorical ? versionId : null,
              };
            });
          return [panel.relationType, requests];
        }),
    );

  const leftLabelRequests = computed(() =>
    labelRequestsFor(leftVersion.value, leftVersionId.value),
  );
  const rightLabelRequests = computed(() =>
    labelRequestsFor(rightVersion.value, rightVersionId.value),
  );

  const relationLabels = ref<Record<string, string>>({});
  const relationLabelsLoading = ref(false);
  const pendingLabels = new Map<string, Promise<void>>();

  const fetchLiveLabel = async (entityType: string, id: string) => {
    try {
      const { data } = await apolloClient.query<
        GetEntityByIdQuery,
        GetEntityByIdQueryVariables
      >({
        query: GetEntityByIdDocument,
        variables: { id, type: entityType as any },
        fetchPolicy: "no-cache",
      });
      const entity = data?.Entity as Entity | undefined;
      return entity ? getEntityTitle(entity as any) : id;
    } catch {
      return id;
    }
  };

  const fetchHistoricalLabel = async (
    entityType: string,
    id: string,
    versionId: string,
  ): Promise<string | null> => {
    try {
      const { data } = await apolloClient.query<
        GetEntityHistoryVersionDetailQuery,
        GetEntityHistoryVersionDetailQueryVariables
      >({
        query: GetEntityHistoryVersionDetailDocument,
        variables: { id, type: entityType, versionId },
        fetchPolicy: "no-cache",
      });
      const entity = data?.EntityHistoryVersionDetail as Entity | undefined;
      return entity ? getEntityTitle(entity as any) : null;
    } catch {
      return null;
    }
  };

  const resolveLabel = (request: LabelRequest): Promise<void> => {
    if (request.cacheKey in relationLabels.value) return Promise.resolve();
    const pending = pendingLabels.get(request.cacheKey);
    if (pending) return pending;

    const work = (async () => {
      const historical = request.versionId
        ? await fetchHistoricalLabel(
            request.entityType,
            request.id,
            request.versionId,
          )
        : null;
      relationLabels.value[request.cacheKey] =
        historical ?? (await fetchLiveLabel(request.entityType, request.id));
    })();
    pendingLabels.set(request.cacheKey, work);
    return work.finally(() => pendingLabels.delete(request.cacheKey));
  };

  // Titles related entities the same way the live entity picker/list UI
  // already does (BaseLibrary.vue), via the generic getEntityTitle helper.
  // A historical side asks for the related entity as it was at that
  // version, so a renamed person keeps the name it had back then.
  watch(
    [leftLabelRequests, rightLabelRequests],
    async ([left, right]) => {
      const requests = [...Object.values(left), ...Object.values(right)].flat();
      if (requests.length === 0) return;

      relationLabelsLoading.value = true;
      await Promise.all(requests.map(resolveLabel));
      relationLabelsLoading.value = false;
    },
    { immediate: true },
  );

  const labelFromRequests = (
    requests: Record<string, LabelRequest[]>,
    relationType: string,
    id: string,
  ): string | undefined => {
    const request = requests[relationType]?.find((item) => item.id === id);
    if (!request) return undefined;
    return (
      relationLabels.value[request.cacheKey] ??
      relationLabels.value[request.liveCacheKey]
    );
  };

  const buildRelationDiffs = (
    labelFor: (relationType: string, id: string) => string,
  ): RelationDiff[] =>
    relationPanels.value.map((panel): RelationDiff => {
      const diff = relationListDiffs.value[panel.relationType];
      const itemsFor = (ids: string[], status: RelationDiffItem["status"]) =>
        ids.map((id) => ({
          key: id,
          label: labelFor(panel.relationType, id),
          status,
        }));

      return {
        relationType: panel.relationType,
        label: panel.label,
        items: [
          ...itemsFor(diff.addedIds, "added"),
          ...itemsFor(diff.removedIds, "removed"),
          ...itemsFor(diff.unchangedIds, "unchanged"),
        ],
      };
    });

  const leftLabelFor = (relationType: string, id: string) =>
    labelFromRequests(leftLabelRequests.value, relationType, id) ??
    labelFromRequests(rightLabelRequests.value, relationType, id) ??
    id;

  const rightLabelFor = (relationType: string, id: string) =>
    labelFromRequests(rightLabelRequests.value, relationType, id) ??
    labelFromRequests(leftLabelRequests.value, relationType, id) ??
    id;

  const relationDiffs = computed<RelationDiff[]>(() =>
    buildRelationDiffs(leftLabelFor),
  );

  const isRenamed = (relationType: string, id: string): boolean => {
    const leftLabel = labelFromRequests(leftLabelRequests.value, relationType, id);
    const rightLabel = labelFromRequests(
      rightLabelRequests.value,
      relationType,
      id,
    );
    return (
      !!leftLabel &&
      !!rightLabel &&
      leftLabel !== id &&
      rightLabel !== id &&
      leftLabel !== rightLabel
    );
  };

  const sideRelationDiffs = (
    labelFor: (relationType: string, id: string) => string,
    hiddenStatus: RelationDiffItem["status"],
    variant: NonNullable<RelationDiffItem["variant"]>,
  ): RelationDiff[] =>
    buildRelationDiffs(labelFor).map((diff) => ({
      ...diff,
      items: diff.items
        .filter((item) => item.status !== hiddenStatus)
        .map((item) =>
          item.status === "unchanged" && isRenamed(diff.relationType, item.key)
            ? { ...item, status: "renamed" as const, variant }
            : item,
        ),
    }));

  const leftRelationDiffs = computed<RelationDiff[]>(() =>
    sideRelationDiffs(leftLabelFor, "removed", "current"),
  );

  const rightRelationDiffs = computed<RelationDiff[]>(() =>
    sideRelationDiffs(rightLabelFor, "added", "previous"),
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
    leftVersionMeta,
    rightVersionMeta,
    hasNoHistory,
    versionsError,
    leftVersionError,
    rightVersionError,
    loading,
  };
}
