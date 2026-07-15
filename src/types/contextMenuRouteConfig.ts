import type {
  ContextMenuElodyActionEnum,
  ContextMenuFormFlow,
  ContextMenuGeneralActionEnum,
  EntityButtonStyle,
  EntityButtonConfig,
  TypeModals,
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
  formRelationType?: string;
  typeModal?: TypeModals;
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

export type ToggleEntityButtonConfig = {
  toggle: true;
  metadataKey: string;
  whenTrue: EntityButtonConfig;
  whenFalse: EntityButtonConfig;
};

export const isToggleButton = (
  btn: EntityButtonConfig | ToggleEntityButtonConfig,
): btn is ToggleEntityButtonConfig => "toggle" in btn && btn.toggle === true;

export type EntityConfig = {
  actions?: ContextMenuActionRouteConfig[];
  hasEditMetadataButton?: boolean;
  deleteButton?: EntityButtonConfig | ToggleEntityButtonConfig | false;
};

export type EntityPageConfig = Record<string, EntityConfig>;

declare module "vue-router" {
  interface RouteMeta {
    entityPageConfig?: EntityPageConfig;
  }
}
