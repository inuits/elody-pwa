type MetadataEntry = { key: string; value: unknown };

const isMetadataEntry = (entry: unknown): entry is MetadataEntry =>
  typeof entry === "object" &&
  entry !== null &&
  typeof (entry as MetadataEntry).key === "string" &&
  (entry as MetadataEntry).key !== "";

export const createEntityFromOptionMetadata = (
  labelKey: string | null | undefined,
  label: string,
  extraMetadata?: unknown[] | null,
): MetadataEntry[] => {
  const metadata: MetadataEntry[] = labelKey
    ? [{ key: labelKey, value: label }]
    : [];
  (extraMetadata ?? [])
    .filter(isMetadataEntry)
    .filter((entry) => entry.key !== labelKey)
    .forEach((entry) => metadata.push({ key: entry.key, value: entry.value }));
  return metadata;
};
