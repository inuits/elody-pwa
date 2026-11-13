import { useFormHelper } from "@/composables/useFormHelper";
import type {
  RelationDiff,
  WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

export type HistoryVariant = "previous" | "current";

const values: Record<HistoryVariant, Record<string, unknown>> = {
  previous: {
    title: "Tales from the North Sea",
    publisher: "Lannoo",
    year: "1987",
    description: "<p>A collection of fishermen's tales.</p>",
  },
  current: {
    title: "Tales from the North Sea",
    publisher: "Standaard Uitgeverij",
    year: "1987",
    description:
      "<p>A collection of fishermen's tales, <strong>illustrated</strong>.</p>",
  },
};

export const formIdFor = (variant: HistoryVariant) =>
  `story-history-${variant}`;

export const createHistoryForm = (variant: HistoryVariant) => {
  const formId = formIdFor(variant);
  useFormHelper().createForm(formId, {
    intialValues: values[variant],
    relationValues: {},
  } as never);
  return formId;
};

const metadata = (key: string, label: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
});

export const makersElement = {
  __typename: "EntityListElement",
  label: "Makers",
  relationType: "hasMaker",
};

export const descriptionElement = {
  __typename: "WysiwygElement",
  label: "Description",
  metadataKey: "description",
};

export const panel = {
  __typename: "WindowElementPanel",
  label: "Info",
  title: metadata("title", "Title"),
  publisher: metadata("publisher", "Publisher"),
  year: metadata("year", "Year"),
  makers: makersElement,
  description: descriptionElement,
};

export const windowElements = {
  info: {
    __typename: "WindowElement",
    label: "Metadata",
    panel,
  },
};

export const relationDiffsFor = (variant: HistoryVariant): RelationDiff[] => [
  {
    relationType: "hasMaker",
    label: "Makers",
    items:
      variant === "previous"
        ? [
            { key: "m1", label: "Marie Vermeulen", status: "unchanged" },
            { key: "m3", label: "Lotte De Smet", status: "removed" },
          ]
        : [
            { key: "m1", label: "Marie Vermeulen", status: "unchanged" },
            { key: "m2", label: "Jan Persoon", status: "added" },
          ],
  },
];

export const wysiwygDiffsFor = (variant: HistoryVariant): WysiwygDiff[] => [
  {
    key: "description",
    label: "Description",
    changed: true,
    colorVariant: variant,
  },
];
