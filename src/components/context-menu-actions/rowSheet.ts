import type { ComputedRef, InjectionKey } from "vue";

// What a list row hands its actions sheet on a small screen: the file it acts
// on, shown on top, and its preview as the first item (the eye's place).
export type RowSheet = {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  thumbnailIsLink: boolean;
  preview?: () => void;
};

export const rowSheetKey: InjectionKey<ComputedRef<RowSheet>> =
  Symbol("rowSheet");
