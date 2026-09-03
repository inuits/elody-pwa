
export const resolveValueTranslationKey = (
  metadata: any,
): string | undefined => {
  if (metadata?.valueTranslationKey) return metadata.valueTranslationKey;

  const value = metadata?.value?.label ?? metadata?.value;
  const options = metadata?.inputField?.options;
  if (!value || !options?.length) return undefined;

  return options.find((option: any) => option.value === value)?.label;
};
