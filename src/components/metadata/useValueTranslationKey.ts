
export const resolveOptionLabel = (
  value: unknown,
  options: any[] | undefined | null,
): string | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (!options?.length) return undefined;
  return options.find((option: any) => option.value === value)?.label;
};

export const resolveValueTranslationKey = (
  metadata: any,
): string | undefined => {
  if (metadata?.valueTranslationKey) return metadata.valueTranslationKey;

  const value = metadata?.value?.label ?? metadata?.value;
  return resolveOptionLabel(value, metadata?.inputField?.options);
};
