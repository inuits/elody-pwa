import { format } from "date-fns";
import { watch } from "vue";

export const useDefaultValue = ({
  defaultValue,
  onUpdate,
}: {
  defaultValue?: string;
  onUpdate: (value: string) => void;
}) => {
  const getNormalizedValue = (value: string): string => {
    let normalizedValue = value;

    if (normalizedValue === "$now") {
      normalizedValue = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    }

    return normalizedValue;
  };

  watch(
    () => defaultValue,
    () => {
      if (!defaultValue) return;

      onUpdate(getNormalizedValue(defaultValue));
    },
    { immediate: true },
  );
};
