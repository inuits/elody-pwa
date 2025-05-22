import type { Unit } from "@/generated-types/queries";
import {
  PanelType,
  type PanelInfo,
  type PanelMetaData,
  type WindowElementPanel,
  type EntityListElement,
  type Entity,
  type BaseEntity,
  type IntialValues,
  type Metadata,
  type ColumnList,
  Entitytyping,
  InputFieldTypes,
  RouteNames,
  GetCustomFormattersSettingsDocument,
  DamsIcons,
  type DropdownOption,
  type MetadataInput,
} from "@/generated-types/queries";
import { createI18n } from "vue-i18n";
import { i18n } from "@/main.ts";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  type RouteLocationNormalizedLoaded,
  type Router,
  useRoute,
} from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";
import { apolloClient, typeUrlMapping, auth } from "@/main";
import { toRaw, isProxy } from "vue";

export const goToEntityPage = (
  entity: Entity,
  listItemRouteName: string,
  router: Router,
) => {
  const entityId =
    entity.intialValues?.slug ||
    entity.uuid ||
    getValueFromTeaserMetadata(
      entity.teaserMetadata as Record<string, MetadataInput>,
      "id",
    );

  router.push({
    name: listItemRouteName,
    params: {
      id: entityId,
      type: getMappedSlug(entity),
    },
  });
};

export const goToEntityTypeRoute = (
  entityType: Entitytyping,
  sorting: { key: string; asc: boolean } | undefined = undefined,
  destinations: { entityType: string; destination: string }[],
  router: Router,
) => {
  try {
    const route = destinations.find(
      (destination: { entityType: string; destination: string }) =>
        destination.entityType === entityType,
    );

    if (route) {
      if (router.currentRoute.value.path === `/${route.destination}`) {
        window.location.href = `/${route.destination}`;
      } else {
        router.push(`/${route.destination}`);
      }
      if (sorting) {
        const routes = router.getRoutes();
        const routeLocation = routes.find(
          (routeLocation: RouteLocationNormalizedLoaded) =>
            routeLocation.path.includes(route.destination),
        );
        setSortConfigurationForRoute(routeLocation, sorting);
      }
    }
  } catch (e) {
    console.log("Unable to navigate to this route", e);
  }
};

const getValueFromTeaserMetadata = (
  teaserMetadata: Record<string, MetadataInput> = {},
  key: string,
): string | undefined => {
  if (!teaserMetadata[key]) return undefined;
  const teaserMetadataItem = teaserMetadata[key];

  return teaserMetadataItem.value;
};

export const getTranslatedMessage = (
  key: string,
  variables: Record<string, string> | undefined = undefined,
) => i18n.global.t(key, variables);

export const setSortConfigurationForRoute = (
  route: RouteLocationNormalizedLoaded,
  sorting: { key: string; asc: boolean },
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
  listItemRouteName: string,
) => {
  const entityId =
    entity.intialValues?.slug ||
    entity.uuid ||
    getValueFromTeaserMetadata(
      entity.teaserMetadata as Record<string, metadataInput>,
      "id",
    );

  return {
    name: listItemRouteName,
    params: {
      id: entityId,
      type: getMappedSlug(entity),
    },
  };
};

export const goToEntityPageById = (
  entityId: string,
  entityTypename: any,
  listItemRouteName: string,
  router: Router,
) => {
  router.replace({
    name: listItemRouteName,
    params: {
      id: entityId,
      type: getMappedSlug(entityTypename),
    },
  });
};

export const getMappedSlug = (entity: Entity): string => {
  const mappedSlug = typeUrlMapping?.mapping[entity.__typename];
  return mappedSlug ? mappedSlug : entity.type;
};

export const mapUrlToEntityType = (type: string): string | undefined => {
  return typeUrlMapping?.reverseMapping[type];
};

export const updateEntityMediafileOnlyForMediafiles = (
  mediafileViewerContext: string,
  entity: Entity,
  onlyRemove: boolean = false,
) => {
  if (entity.type?.toLowerCase() === Entitytyping.Mediafile) {
    useEntityMediafileSelector().setEntityMediafiles(
      mediafileViewerContext,
      [],
    );
    if (onlyRemove) return;
    useEntityMediafileSelector().updateSelectedEntityMediafile(
      mediafileViewerContext,
      entity,
    );
  }
};

export const getEntityIdFromRoute = (): string | undefined => {
  return asString(useRoute()?.params["id"]) || undefined;
};

export const setupI18n = (translations: Object, applicationLocale: string) => {
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
    '<a class="underline" target="_blank" href="$1">$1</a>',
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
  sortKey: string,
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
  mediafileViewerContext: String,
  typeOfInputField?: string,
): string => {
  const form = useFormHelper().getForm(entityId);
  if (panelType === PanelType.Metadata && form) {
    if (typeOfInputField === InputFieldTypes.Checkbox)
      return Boolean(form.values.intialValues[metadataItemKey]);
    return form.values.intialValues[metadataItemKey];
  } else if (
    mediafileSelectionState.value[mediafileViewerContext]?.selectedMediafile
  ) {
    return (
      mediafileSelectionState.value[mediafileViewerContext].selectedMediafile
        .intialValues as any
    )?.[metadataItemKey];
  }
  return "";
};

export const getMetadataFields = (
  objectToGetMetadataFrom: WindowElementPanel | PanelMetaData[],
  panelType: PanelType,
  formId: string,
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
    if (
      (value.__typename && value.__typename === "EntityListElement") ||
      value.__typename === "WysiwygElement"
    ) {
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
            undefined,
            value.inputField?.type,
          ),
        inputField: (value as PanelMetaData).inputField,
        showOnlyInEditMode: (value as PanelMetaData).showOnlyInEditMode,
        tooltip: (value as PanelMetaData).tooltip,
        lineClamp: (value as PanelMetaData).lineClamp,
        can: (value as PanelMetaData).can,
      };

      fields.push(field);
    }
  });

  return fields;
};

export const formatTeaserMetadata = (
  teaserMetadata: Record<string, Metadata>,
  intialValues: Record<string, IntialValues>,
  previewComponentEnabled: boolean = false,
): object => {
  const formatted = [];
  for (const key in teaserMetadata) {
    if (key !== "__typename" && intialValues && teaserMetadata[key].label) {
      const newTeaserMetadata = {
        ...teaserMetadata[key],
        value: intialValues[key],
      };
      formatted.push(newTeaserMetadata);
    }
  }
  if (previewComponentEnabled) return [formatted[0]];
  return formatted;
};

type ConversionFunction = (value: string, detail: string) => string;

export const convertUnitToReadbleFormat = (unit: Unit, value: string) => {
  if (unit == undefined) {
    return value;
  }

  const unitConversionTable: Record<string, ConversionFunction> = {
    DATE: (value: string, detail: string) =>
      convertDateToReadbleFormat(value, detail, false),
    DATETIME: (value: string, detail: string) =>
      convertDateToReadbleFormat(value, detail, true),
    SECONDS: (value: string) => `${value} s`,
    COORDINATES: (value: string) =>
      `${(value as any).longitude}, ${(value as any).latitude}`,
    PERCENT: (value: string) =>
      Number(value) !== -1 ? `${Number(value) * 100}%` : "charging",
    VOLT: (value: string) => `${value} V`,
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
  format: string,
  showTime: boolean,
): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: showTime ? "numeric" : undefined,
    minute: showTime ? "numeric" : undefined,
    second: showTime ? "numeric" : undefined,
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
  parentIsEditable?: boolean,
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
  if (entity.intialValues?.prefLabel) title = entity.intialValues.prefLabel;
  return title;
};

export const getFromExpressEndpoint = async (
  endpoint: "config" | "translation" | "version" | "url-mapping",
) => {
  const response = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : `/api/${endpoint}`,
    { cache: "no-store" },
  );
  return await response.json();
};

export const getApplicationDetails = async () => {
  const [config, translations, version, urlMapping] = await Promise.all([
    getFromExpressEndpoint("config"),
    getFromExpressEndpoint("translation"),
    getFromExpressEndpoint("version"),
    getFromExpressEndpoint("url-mapping"),
  ]);

  return { config, translations, version, urlMapping };
};

export const getFormattersSettings = async () => {
  return await apolloClient
    .query({
      query: GetCustomFormattersSettingsDocument,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      return result.data.CustomFormattersSettings;
    });
};

export const getObjectsBasedOnTypename = (
  parent: any,
  typename: string,
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
  dateTimeString: any,
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

export const getHomeRoute = (config: any) => {
  return config.routerConfig.filter((item) => item.name === RouteNames.Home)[0];
};

export const getChildrenOfHomeRoutes = (config: any): [] => {
  return config?.routerConfig.filter((item) => item.name === RouteNames.Home)[0]
    .children;
};

// period string is in format of: "1 week", "2 month", "5 year"
export function calculateFutureDate(period: string): Date {
  const now = new Date();
  const [amount, unit] = period.split(" ");
  switch (unit) {
    case "day":
    case "days":
      now.setDate(now.getDate() + parseInt(amount));
      break;
    case "week":
    case "weeks":
      now.setDate(now.getDate() + parseInt(amount) * 7);
      break;
    case "month":
    case "months":
      now.setMonth(now.getMonth() + parseInt(amount));
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }
  return now.getTime() / 1000;
}

export const getTitleOrNameFromEntity = (entity: Entity): string => {
  return (
    entity.intialValues.title ||
    entity.intialValues.name ||
    entity.intialValues.original_filename ||
    entity.intialValues.filename ||
    entity.intialValues.serial_number ||
    entity.id ||
    entity.uuid
  );
};

export const getRouteMetadataInfoFromEntity = (
  config: any,
  entitytype: Entitytyping | string,
): any => {
  const homeRoutes = getChildrenOfHomeRoutes(config);
  const entityRoute = homeRoutes.filter(
    (item: any) =>
      item.meta.entityType?.toLowerCase() === entitytype.toLowerCase(),
  )[0];
  if (!entityRoute) return;
  return entityRoute.meta;
};

export function downloadCsv(fileName: string, csvString?: string): void {
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export const extractObjectsByTypename = (
  obj: Record<string, any>,
  typename: string,
): Record<string, any>[] => {
  const result: Record<string, any>[] = [];

  const recurse = (current: any): void => {
    if (typeof current !== "object" || current === null) return;

    if (current.__typename === typename) {
      result.push(current);
    }

    Object.keys(current).forEach((key) => {
      recurse(current[key]);
    });
  };

  recurse(obj);

  return result;
};

export const determineDefaultIntialValues = (
  initialData: any,
  columns: ColumnList,
) => {
  const metadataFields = extractObjectsByTypename(columns, "PanelMetaData");

  const newInitialData = { ...initialData };
  const arrayMetadataFields = [
    InputFieldTypes.DropdownMultiselectMetadata,
    InputFieldTypes.DropdownMultiselectRelations,
  ];

  (metadataFields as PanelMetaData[]).forEach((field: PanelMetaData) => {
    const isMetadataCanBeAnArray = arrayMetadataFields.includes(
      field.inputField?.type as InputFieldTypes,
    );
    const isMetadataEmpty = newInitialData[field.key] === "";

    if (isMetadataCanBeAnArray && isMetadataEmpty) {
      newInitialData[field.key] = [];
    }
  });

  return newInitialData;
};

export const deepToRaw = <T>(obj: T): T => {
  if (isProxy(obj)) {
    obj = toRaw(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(deepToRaw) as T;
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepToRaw(value)]),
    ) as T;
  }

  return obj;
};

export const mapModelValueToDropdownOptions = (
  values: any[],
): DropdownOption[] => {
  if (!values) return [];

  if (Array.isArray(values)) {
    return values.map((item) => {
      if (item.__typename === "DropdownOption") return item;
      return {
        icon: DamsIcons.NoIcon,
        label: item,
        value: item,
        __typename: "DropdownOption",
      };
    });
  }

  return [
    {
      icon: DamsIcons.NoIcon,
      label: values,
      value: values,
      __typename: "DropdownOption",
    },
  ];
};

export const requiresAuthForEntity = (
  type: string,
  metaOfChildRoutes: any[],
): boolean => {
  const entityType = mapUrlToEntityType(type) || type;
  if (!entityType) return false;

  const metaOfLinkedEntity = metaOfChildRoutes.find(
    (item) =>
      String(item.entityType).toLowerCase() ===
      String(entityType).toLowerCase(),
  );
  if (!metaOfLinkedEntity || !metaOfLinkedEntity.requiresAuth) return false;

  return !auth.isAuthenticated.value;
};

export const extractTitleKeyFromMetadataFilter = (metadataFilter: string) => {
  return metadataFilter.split(".")[1];
};
