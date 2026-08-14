import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import ContextMenuAction from "./ContextMenuAction.vue";
import {
  type ContextMenuActions,
  ContextMenuElodyActionEnum,
  ContextMenuGeneralActionEnum,
  DamsIcons,
  Entitytyping,
  RouteNames,
} from "@/generated-types/queries";

// ContextMenuAction fans a GraphQL-declared ContextMenuActions object out to
// the concrete action components (link, general, elody, custom, query,
// download-zip) based on __typename.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const allActions = {
  doLinkAction: {
    __typename: "ContextMenuLinkAction",
    label: "contextMenu.contextMenuLinkAction.openDetail",
    icon: DamsIcons.Eye,
  },
  doGeneralAction: {
    __typename: "ContextMenuGeneralAction",
    label: "contextMenu.contextMenuGeneralAction.setPrimaryMediafile",
    icon: DamsIcons.Image,
    action: ContextMenuGeneralActionEnum.SetPrimaryMediafile,
  },
  doElodyAction: {
    __typename: "ContextMenuElodyAction",
    label: "contextMenu.contextMenuElodyAction.deleteRelation",
    icon: DamsIcons.Trash,
    action: ContextMenuElodyActionEnum.DeleteRelation,
  },
  doQueryAction: {
    __typename: "ContextMenuQueryAction",
    label: "contextMenu.contextMenuQueryAction.regenerateLabel",
    icon: DamsIcons.Update,
    query: "GetEntityById",
    refreshAfterAction: true,
  },
  doCustomAction: {
    __typename: "ContextMenuCustomAction",
    label: "contextMenu.contextMenuCustomAction.startOcr",
    icon: DamsIcons.Process,
    action: ContextMenuElodyActionEnum.EndpointCall,
    endpointUrl: "api/ocr/$id",
    endpointMethod: "POST",
  },
  doDownloadZipOfRelatedMediafilesAction: {
    __typename: "ContextMenuDownloadZipOfRelatedMediafilesAction",
    label: "contextMenu.downloadZip",
    icon: DamsIcons.Download,
    endpointUrl: "api/entities/$id/mediafiles/zip",
    endpointMethod: "GET",
    filename: "mediafiles.zip",
  },
} as unknown as ContextMenuActions;

const meta: Meta<typeof ContextMenuAction> = {
  title: "ContextMenuActions/ContextMenuAction",
  component: ContextMenuAction,
  tags: ["autodocs"],
  render: (args) => ({
    components: { ContextMenuAction },
    setup() {
      provide("config", storyConfig);
      return { args };
    },
    template:
      '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><ContextMenuAction v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof ContextMenuAction>;

export const AllActionTypes: Story = {
  args: {
    contextMenuActions: allActions,
    entityId: "mediafile-1",
    entityType: Entitytyping.Mediafile,
    parentEntityId: "manifestation-1",
    bulkOperationsContext: undefined,
    refetchEntities: () => undefined,
  },
};

export const SingleLinkAction: Story = {
  args: {
    contextMenuActions: {
      doLinkAction: allActions.doLinkAction,
    } as ContextMenuActions,
    entityId: "manifestation-1",
    entityType: Entitytyping.Manifestation,
    bulkOperationsContext: undefined,
    refetchEntities: () => undefined,
  },
};
