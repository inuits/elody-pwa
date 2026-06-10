import { omitDeep } from "@apollo/client/utilities";
import type { RepetitiveFormConfig } from "@/composables/useRepetitiveForm";

/**
 * Strips all `__typename` fields that Apollo adds to query results and
 * returns the value typed as `RepetitiveFormConfig`.
 *
 * This is a pure function — no Vue reactivity, fully unit-testable.
 */
export const toRepetitiveFormConfig = (raw: any): RepetitiveFormConfig => {
  return omitDeep(raw, "__typename") as RepetitiveFormConfig;
};

/**
 * Thin composable wrapper.
 * The actual query binding (`GetRepetitiveFormDocument`) is wired in
 * `GuidedFlowModalHost.vue` so that this file remains codegen-free and
 * independently testable.
 *
 * Usage:
 *   const { mapConfig } = useRepetitiveFlowConfig();
 *   const config = mapConfig(queryResult);
 */
export const useRepetitiveFlowConfig = () => {
  return {
    mapConfig: toRepetitiveFormConfig,
  };
};
