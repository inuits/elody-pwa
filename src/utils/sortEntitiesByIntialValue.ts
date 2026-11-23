import type { Entity } from "@/generated-types/queries";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const valueAsText = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "object" && "label" in value)
    return valueAsText((value as { label: unknown }).label);
  if (Array.isArray(value)) return valueAsText(value[0]);
  return String(value).trim();
};

export const sortEntitiesByIntialValue = <T extends Entity>(
  entities: T[],
  key: string,
): T[] =>
  entities
    .map((entity, index) => ({
      entity,
      index,
      value: valueAsText(
        (entity.intialValues as Record<string, unknown> | undefined)?.[key],
      ),
    }))
    .sort((a, b) => {
      if (!a.value && !b.value) return a.index - b.index;
      if (!a.value) return 1;
      if (!b.value) return -1;
      return collator.compare(a.value, b.value) || a.index - b.index;
    })
    .map(({ entity }) => entity);
