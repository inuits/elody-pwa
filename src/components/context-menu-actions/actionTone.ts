import { ActionTone } from "@/generated-types/queries";

type Toned = { tone?: ActionTone | null };

export const isDanger = (action: unknown): boolean =>
  (action as Toned | null)?.tone === ActionTone.Danger;

// The schema flag decides, never the verb: destructive actions sort last.
export const dangerLast = <T>(
  items: T[],
  actionOf: (item: T) => unknown = (item) => item,
): T[] =>
  [...items].sort(
    (a, b) => Number(isDanger(actionOf(a))) - Number(isDanger(actionOf(b))),
  );

export const toneStyle = (action: unknown) =>
  isDanger(action)
    ? { "--menu-item-ink": "var(--color-danger-ink)" }
    : undefined;
