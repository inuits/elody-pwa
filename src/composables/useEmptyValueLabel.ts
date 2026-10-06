import { computed, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";

const EMPTY_VALUE_KEY = "metadata.labels.no-value";

// Design system: an empty value reads "Geen waarde" / "No value" ("-" is
// deprecated). Rendered at --opacity-empty by the caller.
export const useEmptyValueLabel = (): ComputedRef<string> => {
  const { t, te } = useI18n();
  return computed(() =>
    te(EMPTY_VALUE_KEY) ? t(EMPTY_VALUE_KEY) : "No value",
  );
};
