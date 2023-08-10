import { createI18n } from "vue-i18n";
import { PanelType, Unit } from "@/generated-types/queries";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";
import { options } from "dropzone";
import type internal from "stream";

export const getEntityIdFromRoute = (): string | undefined => {
  return asString(useRoute().params["id"]) || undefined;
};

export const i18n = (translations: Object, applicationLocale: string) => {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale: applicationLocale,
    fallbackLocale: "en",
    // @ts-ignore
    messages: translations,
    missingWarn: false,
  });
};

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const stringIsUrl = (value: string): Boolean => {
  let isUrl: Boolean = false;
  if (value.includes("http://") || value.includes("https://")) {
    isUrl = true;
  }
  return isUrl;
};

export const stringIsDate = (value) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return dateRegex.test(value);
};

export const getIdFromKey = (prefix: string = "entities", key: string) => {
  if (key.includes(prefix + "/")) {
    return key.replace(prefix + "/", "");
  } else {
    return key;
  }
};

export const customSort = (
  customSortOrder: string[],
  arrayToSort: any[],
  sortKey: string
) => {
  const ordering: any = {};
  for (let i = 0; i < customSortOrder.length; i++) {
    ordering[customSortOrder[i]] = i;
  }

  arrayToSort.sort(function (a: any, b: any) {
    return ordering[a[sortKey]] - ordering[b[sortKey]];
  });
  return arrayToSort;
};

export const convertSizeToTailwind = (size: string): string => {
  let tailwindSize = "";
  switch (size) {
    case "ten":
      tailwindSize = "w-1/10";
      break;
    case "twenty":
      tailwindSize = "w-2/10";
      break;
    case "thirty":
      tailwindSize = "w-3/10";
      break;
    case "forty":
      tailwindSize = "w-4/10";
      break;
    case "fifty":
      tailwindSize = "w-5/10";
      break;
    case "sixty":
      tailwindSize = "w-6/10";
      break;
    case "seventy":
      tailwindSize = "w-7/10";
      break;
    case "eighty":
      tailwindSize = "w-8/10";
      break;
    case "ninety":
      tailwindSize = "w-9/10";
      break;
    default:
      tailwindSize = "w-full";
  }

  return tailwindSize;
};

const { mediafileSelectionState } = useEntityMediafileSelector();
const { getForm } = useFormHelper();

export const getValueForPanelMetadata = (
  panelType: PanelType,
  metadataItemKey: string,
  entityId: string
): string => {
  const form = getForm(entityId);
  if (panelType === PanelType.Metadata && form) {
    return form.values.intialValues[metadataItemKey] || "";
  } else if (mediafileSelectionState.selectedMediafile) {
    return (mediafileSelectionState.selectedMediafile.intialValues as any)?.[
      metadataItemKey
    ];
  }
  return "";
};

type ConversionFunction = (value: string, detail: string) => string;

export const convertUnitToReadbleFormat = (unit: Unit, value: string) => {
  if (unit == undefined) {
    return value;
  }

  const unitConversionTable: Record<string, ConversionFunction> = {
    DATETIME: (value: string, detail: string) =>
      convertDateToReadbleFormat(value, detail),
    SECONDS: (value: string) => `${value} s`,
    COORDINATES: (value: string) =>

      `${(value as any).longitude}, ${(value as any).latitude}`,
  };

  const details = unit.split("_");

  if (!unitConversionTable[details[0]] || value == "") {
    console.warn(
      "This unit can not be converted yet or this item has no value"
    );
    return value;
  }
  const conversionFunction = unitConversionTable[details[0] as string];
  return conversionFunction(value, details[1]);
};
export const convertDateToReadbleFormat = (
  dateString: string,
  format: string
): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: undefined,
  };
  let dateFormat;
  if (format !== "DEFAULT") {
    options.hour12 = format.slice(-2) == "12";
  }
  switch (format.slice(0, 3)) {
    case "DMY":
      dateFormat = "en-GB";
      break;
    case "MDY":
      dateFormat = "en-US";
      break;
    default:
      dateFormat = undefined;
      break;
  }
  return new Intl.DateTimeFormat(dateFormat, options).format(date);
};

export const createPlaceholderEntities = (amount: number): any[] => {
  const placeholders = [];
  for (let i = 0; i <= amount; i++) {
    placeholders.push({
      id: `${i}`,
      teaserMetadata: [
        { key: "", value: "", label: "" },
        { key: "", value: "", label: "" },
        { key: "", value: "", label: "" },
        { key: "", value: "", label: "" },
      ],
    });
  }
  return placeholders;
};
