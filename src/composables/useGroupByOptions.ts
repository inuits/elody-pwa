import { computed, ref, shallowRef } from "vue";
import {
  DamsIcons,
  type DropdownOption,
  type GroupByConfig,
} from "@/generated-types/queries";

const NO_GROUP_BY = "";

export type UseGroupByOptionsOptions = {
  onChange: (config: GroupByConfig | null) => void;
};

export const useGroupByOptions = ({ onChange }: UseGroupByOptionsOptions) => {
  const options = shallowRef<GroupByConfig[]>([]);
  const chosenKey = ref<string | undefined>(undefined);

  const hasOptions = computed(() => options.value.length > 0);

  const dropdownOptions = computed<DropdownOption[]>(() => [
    { icon: DamsIcons.NoIcon, label: "library.no-group-by", value: NO_GROUP_BY },
    ...options.value.map((option) => ({
      icon: DamsIcons.NoIcon,
      label: option.label ?? option.key,
      value: option.key,
    })),
  ]);

  const primaryKey = computed(
    () => options.value.find((option) => option.primary)?.key,
  );

  const selectedKey = computed<string>(
    () => chosenKey.value ?? primaryKey.value ?? NO_GROUP_BY,
  );

  const configFor = (key: string) =>
    options.value.find((option) => option.key === key) ?? null;

  const setOptions = (newOptions: GroupByConfig[]) => {
    options.value = newOptions;
    onChange(configFor(selectedKey.value));
  };

  const select = (key: string) => {
    if (key === selectedKey.value) return;
    chosenKey.value = key;
    onChange(configFor(key));
  };

  return { hasOptions, dropdownOptions, selectedKey, setOptions, select };
};
