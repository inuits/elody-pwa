import { computed, type ComputedRef, type InjectionKey } from "vue";
import type {
  CopyFromParentConfig,
  CopyFromParentKeyMap,
  CopyValueFromParentIntialValues,
  PanelMetaData,
} from "@/generated-types/queries";
import { useVeeValidate } from "@/components/metadata/useVeeValidate";
import { useFormHelper } from "@/composables/useFormHelper";
import { getEntityIdFromRoute } from "@/helpers";



export type { CopyFromParentConfig, CopyFromParentKeyMap };

export type ParentValueBuckets = {
  intialValues?: Record<string, any> | null;
  relationValues?: Record<string, any> | null;
  relationMetadata?: Record<string, any> | null;
};

export type FieldCopyConfig = {
  key: string;
  fromKey: string;
  fromRelationType?: string;
  label?: string;
  labelFromField: boolean;
  autoCopy: boolean;
};

export type CopyPlanEntry = FieldCopyConfig & {
  field: PanelMetaData;
  formKey: string;
  value: unknown;
};

export type ParentValueReader = (
  fromRelationType?: string,
) => ParentValueBuckets | undefined;

export type NestedFormValues = Record<string, Record<string, unknown>>;

const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};


export const readParentValue = (
  buckets: ParentValueBuckets | undefined,
  fromKey: string,
): unknown => {
  if (!buckets || !fromKey) return undefined;
  const candidates = [
    buckets.intialValues?.[fromKey],
    buckets.relationValues?.[fromKey],
    buckets.relationMetadata?.[fromKey],
  ];
  return candidates.find(hasValue);
};

const perFieldOverride = (
  field: PanelMetaData,
): CopyValueFromParentIntialValues | undefined =>
  (field as any).copyValueFromParent ?? undefined;

export const resolveFieldCopyConfig = (
  field: PanelMetaData,
  config: CopyFromParentConfig | undefined | null,
): FieldCopyConfig | undefined => {
  const key = field?.key;
  if (!key) return undefined;

  const override = perFieldOverride(field);
  const formAutoCopy = config?.autoCopy === true;

  if (override?.key) {
    return {
      key,
      fromKey: override.key,
      fromRelationType:
        override.fromRelationType ?? config?.fromRelationType ?? undefined,
      label: override.label ?? labelFor(key, config),
      labelFromField: Boolean(override.label),
      autoCopy:
        override.autoCopy === undefined || override.autoCopy === null
          ? formAutoCopy
          : override.autoCopy === true,
    };
  }

  if (!config) return undefined;
  if (config.keys?.length && !config.keys.includes(key)) return undefined;
  if (config.excludeKeys?.includes(key)) return undefined;

  const mapped = config.keyMap?.find((entry) => entry.key === key);
  return {
    key,
    fromKey: mapped?.fromKey ?? key,
    fromRelationType:
      mapped?.fromRelationType ?? config.fromRelationType ?? undefined,
    label: labelFor(key, config),
    labelFromField: false,
    autoCopy: formAutoCopy,
  };
};

const labelFor = (
  key: string,
  config: CopyFromParentConfig | undefined | null,
): string | undefined =>
  config?.labelPrefix ? `${config.labelPrefix}.${key}` : undefined;


const formKeyFor = (field: PanelMetaData): string => {
  const { getVeeValidateKey } = useVeeValidate();
  return getVeeValidateKey({ metadata: field, isEdit: true });
};


export const buildCopyPlan = (
  fields: PanelMetaData[],
  config: CopyFromParentConfig | undefined | null,
  readParent: ParentValueReader,
): CopyPlanEntry[] => {
  const plan: CopyPlanEntry[] = [];

  for (const field of fields ?? []) {
    const fieldConfig = resolveFieldCopyConfig(field, config);
    if (!fieldConfig) continue;

    let value = fieldConfig.fromRelationType
      ? readParentValue(
          readParent(fieldConfig.fromRelationType),
          fieldConfig.fromKey,
        )
      : undefined;

    if (!hasValue(value))
      value = readParentValue(readParent(undefined), fieldConfig.fromKey);
    if (!hasValue(value)) continue;

    plan.push({ ...fieldConfig, field, formKey: formKeyFor(field), value });
  }

  return plan;
};


export const plansToNestedValues = (
  plan: CopyPlanEntry[],
  { autoCopyOnly = false }: { autoCopyOnly?: boolean } = {},
): NestedFormValues => {
  const values: NestedFormValues = {};

  for (const entry of plan) {
    if (autoCopyOnly && !entry.autoCopy) continue;
    const [bucket, ...rest] = entry.formKey.split(".");
    if (!bucket || rest.length === 0) continue;
    (values[bucket] ??= {})[rest.join(".")] = entry.value;
  }

  return values;
};


export const shouldShowCopyButton = (
  entry: CopyPlanEntry | undefined,
  config: CopyFromParentConfig | undefined | null,
): boolean => {
  if (!entry?.label) return false;
  return config?.showCopyButtons === true || entry.labelFromField;
};

export const mergeNestedValues = (
  current: Record<string, any> | undefined,
  prefill: NestedFormValues,
): Record<string, any> => {
  const merged: Record<string, any> = { ...(current ?? {}) };
  for (const [bucket, entries] of Object.entries(prefill)) {
    merged[bucket] = { ...(merged[bucket] ?? {}), ...entries };
  }
  return merged;
};


export type CopyFromParentContext = {
  buttonFor: (field: PanelMetaData) => { label: string; copy: () => void } | undefined;
};

export const copyFromParentContextKey: InjectionKey<CopyFromParentContext> =
  Symbol("copyFromParentContext");

export const useCopyFromParent = (options: {
  config: () => CopyFromParentConfig | undefined | null;
  fields: () => PanelMetaData[];
  sourceFormId?: () => string | undefined;
}): {
  sourceFormId: ComputedRef<string | undefined>;
  plan: ComputedRef<CopyPlanEntry[]>;
  autoCopyValues: ComputedRef<NestedFormValues>;
  copyAllLabel: ComputedRef<string | undefined>;
  entryFor: (field: PanelMetaData) => CopyPlanEntry | undefined;
  buttonEntryFor: (field: PanelMetaData) => CopyPlanEntry | undefined;
} => {
  const { getForm } = useFormHelper();
  const routeEntityId = getEntityIdFromRoute();

  const sourceFormId = computed(
    () => options.sourceFormId?.() || routeEntityId,
  );

  const readParent: ParentValueReader = (fromRelationType) => {
    const hostForm = getForm(sourceFormId.value);
    if (!hostForm) return undefined;
    if (!fromRelationType) return hostForm.values as ParentValueBuckets;

    const relations = hostForm.values.relationValues?.[fromRelationType];
    const relatedId = Array.isArray(relations) ? relations[0]?.key : undefined;
    return getForm(relatedId)?.values as ParentValueBuckets | undefined;
  };

  const plan = computed<CopyPlanEntry[]>(() =>
    buildCopyPlan(options.fields(), options.config(), readParent),
  );

  const entryFor = (field: PanelMetaData): CopyPlanEntry | undefined =>
    plan.value.find((entry) => entry.key === field?.key);

  return {
    sourceFormId,
    plan,
    autoCopyValues: computed(() =>
      plansToNestedValues(plan.value, { autoCopyOnly: true }),
    ),
    copyAllLabel: computed(() => options.config()?.copyAllLabel ?? undefined),
    entryFor,
    buttonEntryFor: (field: PanelMetaData) => {
      const entry = entryFor(field);
      return shouldShowCopyButton(entry, options.config()) ? entry : undefined;
    },
  };
};
