import { createI18n } from "vue-i18n";
import messages from "@intlify/vite-plugin-vue-i18n/messages";
import { useRoute } from "vue-router";
import {
  PanelType,
  Unit,
  type Entity,
  type BaseEntity,
} from "./generated-types/queries";
import { useEntityMediafileSelector } from "./components/EntityImageSelection.vue";
import { useFormHelper } from "./composables/useFormHelper";
import type { Location } from "./components/EntityElementCoordinateEdit.vue";

export const langs: string[] = ["nl", "fr"];

export const mergeLanguageJsonFiles = (messages: any, langs: string[]): any => {
  const newMessages: any = {};
  langs.forEach((lang: string) => {
    for (const propt in messages) {
      if (propt.includes(lang)) {
        newMessages[lang] = { ...newMessages[lang], ...messages[propt] };
      }
    }
  });
  return newMessages;
};

export const getEntityIdFromRoute = (): string | undefined => {
  return asString(useRoute().params["id"]) || undefined;
};

export const i18n = createI18n({
  globalInjection: true,
  locale: "nl",
  fallbackLocale: "nl",
  messages: mergeLanguageJsonFiles(messages, langs),
});

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const stringIsUrl = (value: string): Boolean => {
  let isUrl: Boolean = false;
  if (value.includes("http://") || value.includes("https://")) {
    isUrl = true;
  }
  return isUrl;
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
  metadataItemKey: string
): string => {
  const id = getEntityIdFromRoute() || "";
  const form = getForm(id);
  const selectedMediafile: { [index: string]: any } | undefined =
    mediafileSelectionState.selectedMediafile;
  if (panelType === PanelType.Metadata && form) {
    return form.values[metadataItemKey] || "";
  } else if (selectedMediafile) {
    return selectedMediafile[metadataItemKey];
  }
  return "";
};

export const convertUnitToReadbleFormat = (unit: Unit, value: string) => {
  const unitConversionTable = {
    datetime: (value: string) => new Date(value).toLocaleString(),
    seconds: (value: string) => `${value} s`,
    coordinates: (value: string) =>
      `${(value as any).longitude}, ${(value as any).latitude}`,
  };

  if (!unitConversionTable[unit] || value == "") {
    console.warn(
      "This unit can not be converted yet or this item has no value"
    );
    return value;
  }

  const conversionFunction = unitConversionTable[unit];

  return conversionFunction(value);
};

export const createPlaceholderEntities = (amount: number): any[] => {
  const placeholders = [];
  for (let i = 0; i <= amount; i++) {
    placeholders.push({
      id: "/",
      teaserMetadata: [
        { key: "/", value: "/", label: "/" },
        { key: "/", value: "/", label: "/" },
        { key: "/", value: "/", label: "/" },
        { key: "/", value: "/", label: "/" },
      ],
    });
  }
  return placeholders;
};
