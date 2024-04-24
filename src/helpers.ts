import {
  PanelType,
  Unit,
  type PanelInfo,
  type PanelMetaData,
  type WindowElementPanel,
  type EntityListElement,
  type Entity,
  type BaseEntity,
  Entitytyping,
} from "@/generated-types/queries";
import { createI18n } from "vue-i18n";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import { type Router, useRoute } from "vue-router";

export const goToEntityPage = (
  entity: Entity,
  listItemRouteName: string,
  router: Router
) => {
  if (entity.type.toLowerCase() === Entitytyping.Mediafile) {
    useEntityMediafileSelector().setEntityMediafiles([]);
    useEntityMediafileSelector().updateSelectedEntityMediafile(entity);
  }

  const entityId =
    entity.intialValues?.slug ||
    entity.uuid ||
    entity.teaserMetadata?.find((dataItem) => dataItem?.key === "id")?.value;

  router.replace({
    name: listItemRouteName,
    params: {
      id: entityId,
      type: entityId.includes("tracker") ? "IotDeviceTracker" : entity.type,
    },
  });
};

export const getEntityPageRoute = (
  entity: Entity,
  listItemRouteName: string
) => {
  const entityId =
    entity.intialValues?.slug ||
    entity.uuid ||
    entity.teaserMetadata?.find((dataItem) => dataItem?.key === "id")?.value;

  return {
    name: listItemRouteName,
    params: {
      id: entityId,
      type: entityId.includes("tracker") ? "IotDeviceTracker" : entity.type,
    },
  };
};

export const updateEntityMediafileOnlyForMediafiles = (
  entity: Entity,
  onlyRemove: boolean = false
) => {
  if (entity.type.toLowerCase() === Entitytyping.Mediafile) {
    useEntityMediafileSelector().setEntityMediafiles([]);
    if (onlyRemove) return;
    useEntityMediafileSelector().updateSelectedEntityMediafile(entity);
  }
};

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
    fallbackWarn: false,
  });
};

export const setCssVariable = (variableName: string, value: string): void => {
  const root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty(variableName, value);
};

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const processTextWithLinks = (value: unknown) => {
  if (value && typeof value !== "string") return value;

  const stringValue = value as string;
  const pattern = /\b(https?:\/\/\S+)\b/g;
  const textWithLinks = stringValue.replace(
    pattern,
    '<a class="underline" target="_blank" href="$1">$1</a>'
  );
  return textWithLinks;
};

export const stringIsUrl = (value: unknown): Boolean => {
  if (value && typeof value !== "string") return false;

  const stringValue = value as string;
  const pattern: RegExp = /\bhttps:\/\/\S+/gi;
  const matches: RegExpMatchArray | null = stringValue.match(pattern);
  if (!matches || matches.length === 0) return false;

  return true;
};

export const stringIsHtml = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  return /<\/?[a-z][\s\S]*>/i.test(value);
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

export const convertSizeToTailwind = (size: string = "hundred"): string => {
  const sizeObject: { [key: string]: string } = {
    ten: "w-1/10",
    twenty: "w-2/10",
    thirty: "w-3/10",
    forty: "w-4/10",
    fifty: "w-5/10",
    sixty: "w-6/10",
    seventy: "w-7/10",
    eighty: "w-8/10",
    ninety: "w-9/10",
    hundred: "w-full",
  };

  return sizeObject[size];
};

const { mediafileSelectionState } = useEntityMediafileSelector();

export const getValueForPanelMetadata = (
  panelType: PanelType,
  metadataItemKey: string,
  entityId: string
): string => {
  const form = useFormHelper().getForm(entityId);
  if (panelType === PanelType.Metadata && form) {
    return form.values.intialValues[metadataItemKey];
  } else if (mediafileSelectionState.selectedMediafile) {
    return (mediafileSelectionState.selectedMediafile.intialValues as any)?.[
      metadataItemKey
    ];
  }
  return "";
};

export const getMetadataFields = (
  objectToGetMetadataFrom: WindowElementPanel | PanelMetaData[],
  panelType: PanelType,
  formId: string
): Array<PanelMetaData | EntityListElement> => {
  const fields: Array<PanelMetaData | EntityListElement> = [];

  Object.values(objectToGetMetadataFrom).forEach((value) => {
    if (!value || typeof value !== "object") return;
    if (value.__typename && value.__typename === "EntityListElement") {
      fields.push(value);
    } else {
      const key: string = (value as PanelMetaData).key;
      const field = {
        key: key,
        label: (value as PanelMetaData).label,
        unit: (value as PanelMetaData).unit,
        linkText: (value as PanelMetaData).linkText,
        value:
          (value as PanelInfo).value ||
          getValueForPanelMetadata(panelType, key, formId),
        inputField: (value as PanelMetaData).inputField,
      };

      fields.push(field);
    }
  });

  return fields;
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
  for (let i = 0; i < amount; i++) {
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

export const findPanelMetadata = (
  obj: any,
  parentIsEditable?: boolean
): PanelMetaData[] => {
  const results: PanelMetaData[] = [];

  if (obj && obj.__typename === "PanelMetaData") {
    if (parentIsEditable !== false) {
      results.push(obj);
    }
  }

  if (typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const nestedResults = findPanelMetadata(obj[key], obj.isEditable);
        results.push(...nestedResults);
      }
    }
  }

  return results;
};

export const getEntityTitle = (entity: BaseEntity): string => {
  let title: string = entity.id;
  if (entity.intialValues?.title) title = entity.intialValues.title;
  if (entity.intialValues?.name) title = entity.intialValues.name;
  if (entity.intialValues?.email) title = entity.intialValues.email;
  return title;
};

export const getApplicationDetails = async () => {
  const config = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/config"
  ).then((r) => r.json());
  const translations = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/translation"
  ).then((r) => r.json());
  return { config, translations };
};

export const getObjectsBasedOnTypename = (
  parent: any,
  typename: string
): [] => {
  const objects = [];
  Object.values(parent).forEach((child) => {
    if (child?.__typename === typename) objects.push(child);
  });
  return objects;
};
