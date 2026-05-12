import type {
  ContextMenuElodyActionEnum,
  ContextMenuFormFlow,
  ContextMenuGeneralActionEnum,
  EntityButtonStyle,
  EntityButtonConfig,
} from "@/generated-types/queries";

export type { EntityButtonStyle, EntityButtonConfig };

type BaseAction = {
  label: string;
  icon: string;
  can?: string[];
};

export type DownloadZipActionConfig = BaseAction & {
  type: "downloadZip";
  endpointUrl: string;
  endpointMethod: string;
  filename?: string;
};

export type ElodyActionConfig = BaseAction & {
  type: "elody";
  action: ContextMenuElodyActionEnum;
  formQuery?: string;
  formFlow?: ContextMenuFormFlow;
  formTitle?: string;
  hidden?: boolean;
  showAsButton?: boolean;
};

export type QueryActionConfig = BaseAction & {
  type: "query";
  query: string;
  refreshAfterAction?: boolean;
};

export type LinkActionConfig = BaseAction & {
  type: "link";
};

export type GeneralActionConfig = BaseAction & {
  type: "general";
  action: ContextMenuGeneralActionEnum;
};

export type CustomActionConfig = BaseAction & {
  type: "custom";
  action: ContextMenuElodyActionEnum;
  endpointUrl: string;
  endpointMethod: string;
};

export type ContextMenuActionRouteConfig =
  | DownloadZipActionConfig
  | ElodyActionConfig
  | QueryActionConfig
  | LinkActionConfig
  | GeneralActionConfig
  | CustomActionConfig;

export type EntityConfig = {
  actions?: ContextMenuActionRouteConfig[];
  hasEditMetadataButton?: boolean;
  deleteButton?: EntityButtonConfig | false;
};

export type EntityPageConfig = Record<string, EntityConfig>;

declare module "vue-router" {
  interface RouteMeta {
    entityPageConfig?: EntityPageConfig;
  }
}
