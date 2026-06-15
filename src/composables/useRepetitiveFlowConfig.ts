import { omitDeep } from "@apollo/client/utilities";
import type {
  RepetitiveForm,
  RepetitiveStep,
} from "@/generated-types/queries";

const dropEmpty = <T extends Record<string, any>>(
  obj: T,
  keys: string[],
): T => {
  const copy: Record<string, any> = { ...obj };
  for (const key of keys) {
    if (copy[key] === "") delete copy[key];
  }
  return copy as T;
};

const normalizeStep = (step: any): RepetitiveStep => {
  const normalized = dropEmpty(step, [
    "label",
    "pickerQuery",
    "pickerFiltersQuery",
  ]);
  // 0 is the echo resolver's "not configured" value and means "no limit"
  if (!normalized.maxSelection) delete normalized.maxSelection;
  if (!normalized.overviewFields?.length) delete normalized.overviewFields;
  if (normalized.scopeToRelationOf)
    normalized.scopeToRelationOf = dropEmpty(normalized.scopeToRelationOf, [
      "filterKey",
    ]);
  return normalized;
};

/**
 * Maps a raw `GetRepetitiveForm` query result onto a `RepetitiveForm` config.
 *
 * The flow config comes from a self-describing query in which every step is
 * an aliased `steps` field (e.g. `work: steps { ... }`), each resolving to a
 * single-element array. Steps are therefore collected from all array-valued
 * top-level keys, in query-field order. Also strips Apollo's `__typename`
 * fields and drops optional inputs the echo resolvers return as `""`.
 *
 * This is a pure function — no Vue reactivity, fully unit-testable.
 */
export const toRepetitiveFormConfig = (raw: any): RepetitiveForm => {
  if (!raw) return { repeatable: false, steps: [] };
  const cleaned = omitDeep(raw, "__typename") as Record<string, any>;
  const { label, repeatable, finalize, ...rest } = cleaned;
  const steps = Object.values(rest)
    .filter(Array.isArray)
    .flat()
    .map(normalizeStep);
  const config: RepetitiveForm = {
    repeatable: Boolean(repeatable),
    steps,
  };
  if (label) config.label = label;
  if (finalize) config.finalize = dropEmpty(finalize, ["label"]);
  return config;
};

/**
 * Thin composable wrapper.
 * The query itself is loaded by name (the modal's `formQuery`) and executed
 * in `GuidedFlowModalHost.vue` so that this file remains codegen-free and
 * independently testable.
 */
export const useRepetitiveFlowConfig = () => {
  return {
    mapConfig: toRepetitiveFormConfig,
  };
};
