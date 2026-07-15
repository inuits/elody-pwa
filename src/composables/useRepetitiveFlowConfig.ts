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
  if (!normalized.maxSelection) delete normalized.maxSelection;
  if (!normalized.overviewFields?.length) delete normalized.overviewFields;
  if (!normalized.creatableTypes?.length) delete normalized.creatableTypes;
  if (normalized.scopeToRelationOf)
    normalized.scopeToRelationOf = dropEmpty(normalized.scopeToRelationOf, [
      "filterKey",
    ]);
  return normalized;
};

export const toRepetitiveFormConfig = (raw: any): RepetitiveForm => {
  if (!raw) return { repeatable: false, steps: [] };
  const cleaned = omitDeep(raw, "__typename") as Record<string, any>;
  const { label, repeatable, linear, routeToStep, routeToRoute, finalize, ...rest } = cleaned;
  const steps = Object.values(rest)
    .filter(Array.isArray)
    .flat()
    .map(normalizeStep);
  const config: RepetitiveForm = {
    repeatable: Boolean(repeatable),
    steps,
  };
  if (label) config.label = label;
  config.linear = Boolean(linear);
  if (routeToStep) config.routeToStep = routeToStep;
  if (routeToRoute) config.routeToRoute = routeToRoute;
  if (finalize) {
    const normalizedFinalize = dropEmpty(finalize, ["label"]);
    if (!normalizedFinalize.creatableTypes?.length)
      delete normalizedFinalize.creatableTypes;
    config.finalize = normalizedFinalize;
  }
  return config;
};

export const useRepetitiveFlowConfig = () => {
  return {
    mapConfig: toRepetitiveFormConfig,
  };
};
