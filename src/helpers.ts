import {
  PanelType,
  Unit,
  type PanelInfo,
  type PanelMetaData,
  type WindowElementPanel,
  type EntityListElement,
  type Entity,
  type BaseEntity,
  type IntialValues,
  type Metadata,
  Entitytyping,
  InputFieldTypes,
  RouteNames,
} from "@/generated-types/queries";
import { createI18n } from "vue-i18n";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  type RouteLocationNormalizedLoaded,
  type Router,
  useRoute,
} from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";

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

export const goToEntityTypeRoute = (
  entityType: Entitytyping,
  sorting: { key: string; asc: boolean } | undefined = undefined,
  destinations: { entityType: string; destination: string }[],
  router: Router
) => {
  try {
    const route = destinations.find(
      (destination: { entityType: string; destination: string }) =>
        destination.entityType === entityType
    );

    if (route) {
      router.push(`/${route.destination}`);
      if (sorting) {
        const routes = router.getRoutes();
        const routeLocation = routes.find(
          (routeLocation: RouteLocationNormalizedLoaded) =>
            routeLocation.path.includes(route.destination)
        );
        setSortConfigurationForRoute(routeLocation, sorting);
      }
    }
  } catch (e) {
    console.log("Unable to navigate to this route", e);
  }
};

export const setSortConfigurationForRoute = (
  route: RouteLocationNormalizedLoaded,
  sorting: { key: string; asc: boolean }
) => {
  const currentRouteState = useStateManagement().getStateForRoute(route);
  const newRouteState = { ...currentRouteState };
  if (newRouteState.queryVariables) {
    newRouteState.queryVariables.searchValue.order_by = sorting.key;
    newRouteState.queryVariables.searchValue.isAsc = sorting.asc;
  }
  useStateManagement().updateStateForRoute(route, newRouteState);
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
  return asString(useRoute()?.params["id"]) || undefined;
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
  try {
    if (value && typeof value !== "string") return false;

    const stringValue = value as string;
    const pattern: RegExp = /\bhttps?:\/\/\S+/gi;
    const matches: RegExpMatchArray | null = stringValue.match(pattern);
    return !(!matches || matches.length === 0);
  } catch {
    return false;
  }
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
  entityId: string,
  typeOfInputField?: string
): string => {
  const form = useFormHelper().getForm(entityId);
  if (panelType === PanelType.Metadata && form) {
    if (typeOfInputField === InputFieldTypes.Checkbox)
      return Boolean(form.values.intialValues[metadataItemKey]);
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

  if (panelType === PanelType.BulkData && objectToGetMetadataFrom.bulkData)
    return objectToGetMetadataFrom.bulkData.map((bulkDataItem: any) => {
      return {
        label: bulkDataItem.key,
        key: bulkDataItem.key,
        value: bulkDataItem.value,
      };
    });

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
          getValueForPanelMetadata(
            panelType,
            key,
            formId,
            value.inputField?.type
          ),
        inputField: (value as PanelMetaData).inputField,
        showOnlyInEditMode: (value as PanelMetaData).showOnlyInEditMode,
      };

      fields.push(field);
    }
  });

  return fields;
};

export const formatTeaserMetadata = (
  teaserMetadata: Record<string, Metadata>,
  intialValues: Record<string, IntialValues>
): object => {
  const formatted = [];
  for (const key in teaserMetadata) {
    if (key !== "__typename" && intialValues && teaserMetadata[key].label) {
      const newTeaserMetadata = {
        ...teaserMetadata[key],
        value: intialValues[key]
      }
      formatted.push(newTeaserMetadata);
    }
  }
  return formatted;
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

export const isDateTime = (dateTimeString: any): boolean => {
  if (
    typeof dateTimeString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateTimeString)
  )
    return false;
  const date = new Date(dateTimeString);
  return !isNaN(date.getTime());
};

export const addCurrentTimeZoneToDateTimeString = (
  dateTimeString: any
): string => {
  if (typeof dateTimeString !== "string") return dateTimeString;
  const date = new Date();
  const timeZoneOffset = -date.getTimezoneOffset();
  const sign = timeZoneOffset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(timeZoneOffset) / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (Math.abs(timeZoneOffset) % 60).toString().padStart(2, "0");
  const timeZoneString = `${sign}${hours}:${minutes}`;

  return dateTimeString + timeZoneString;
};

export const extractDate = (dateTimeStr: string): string => {
  const dt = new Date(dateTimeStr);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");

  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return `${year}-${month}-${day}`;
};

export const extractTime = (dateTimeStr: string): string => {
  const dt = new Date(dateTimeStr);
  const time = dt.toTimeString().split(" ")[0];
  return time === "Invalid" ? undefined : time;
};

export const getUserName = (auth: any): string => {
  if (!auth.user) return "unknown";
  const user = auth.user;
  return user.name || user.given_name || user.email || user.family_name;
};

export const getChildrenOfHomeRoutes = (config: any): [] => {
  return config.routerConfig.filter((item) => item.name === RouteNames.Home)[0].children;
}

// period string is in format of: "1 week", "2 month", "5 year"
export function calculateFutureDate(period: string): Date {
  const now = new Date();
  const [amount, unit] = period.split(' ');
  switch (unit) {
    case 'day':
    case 'days':
      now.setDate(now.getDate() + parseInt(amount));
      break;
    case 'week':
    case 'weeks':
      now.setDate(now.getDate() + parseInt(amount) * 7);
      break;
    case 'month':
    case 'months':
      now.setMonth(now.getMonth() + parseInt(amount));
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }
  return now.getTime();
}