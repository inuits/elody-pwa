import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PreviewWrapper from "../PreviewWrapper.vue";
import {
  Entitytyping,
  ListItemCoverageTypes,
  PreviewTypes,
} from "@/generated-types/queries";
import {
  changeRequest,
  changesPreviewConfig,
  METADATA_PREVIEW_QUERY,
  previewEntity,
  providePreviewConfig,
  registerChangedEntity,
  registerPreviewFixtures,
} from "./previewFixtures";
import { PENDING_QUERY, registerQueryFixture } from "@/main";
import { isCompact } from "@/composables/useNavMenu";

const entities = [
  previewEntity("m1", {
    title: "harbour-1920.tif",
    original_filename: "harbour-1920.tif",
    license: "CC BY 4.0",
    minimal_attribution: "City Archive",
  }),
];

const meta: Meta<typeof PreviewWrapper> = {
  title: "Components/PreviewWrapper",
  component: PreviewWrapper,
  parameters: {
    docs: {
      description: {
        component:
          'The preview panel shell beside a list: a header band with the title, "Open detail page" when the list ' +
          "navigates, and the close button, then the configured body (column list, media viewer, map or history). " +
          "On a small screen it covers the page and a back button replaces the close.",
      },
    },
  },
  argTypes: {
    previewComponent: { control: "object" },
    detailPath: { control: "text", type: { name: "string", required: false } },
    onClosePreviewComponent: { action: "closePreviewComponent" },
    onTogglePreviewComponent: { action: "togglePreviewComponent" },
  },
  render: (args) => ({
    components: { PreviewWrapper },
    setup() {
      registerPreviewFixtures();
      registerChangedEntity();
      providePreviewConfig();
      return { args };
    },
    template: `<div style="max-width:480px"><preview-wrapper :key="JSON.stringify(args.previewComponent)" v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof PreviewWrapper>;

const base = {
  entityType: Entitytyping.Mediafile,
  entities: entities as never,
  entitiesLoading: false,
  configPerViewMode: {},
  entityId: "m1",
  parentIds: [],
  cropMediafileCoordinatesKey: "",
};

export const Default: Story = {
  args: {
    ...base,
    detailPath: "/mediafile/m1",
    previewComponent: {
      type: PreviewTypes.ColumnList,
      listItemsCoverage: ListItemCoverageTypes.OneListItem,
      metadataPreviewQuery: METADATA_PREVIEW_QUERY,
    },
  },
};

export const WithoutDetailLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A list that does not navigate to its entities shows no "Open detail page".',
      },
    },
  },
  args: { ...Default.args, detailPath: undefined },
};

export const ConfiguredTitle: Story = {
  args: {
    ...Default.args,
    previewComponent: {
      ...Default.args!.previewComponent!,
      title: "Mediafile preview",
    },
  },
};

export const WithChanges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With a changes preview the body splits 2fr | 3fr: the change itself on the left, the related entity's changed fields on the right.",
      },
    },
  },
  render: (args) => ({
    components: { PreviewWrapper },
    setup() {
      registerPreviewFixtures();
      registerChangedEntity();
      providePreviewConfig();
      return { args };
    },
    template: `<div style="max-width:760px"><preview-wrapper v-bind="args" /></div>`,
  }),
  args: {
    ...base,
    entities: [changeRequest] as never,
    entityId: "c1",
    previewComponent: {
      type: PreviewTypes.ColumnList,
      listItemsCoverage: ListItemCoverageTypes.OneListItem,
      metadataPreviewQuery: METADATA_PREVIEW_QUERY,
      changesPreview: changesPreviewConfig,
    },
  },
};

const LOADING_QUERY = "GetSortOptions";

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Loading: a spinner while the preview's fields are fetched. Open: the header and the fields.",
      },
    },
  },
  render: (args) => ({
    components: { PreviewWrapper },
    setup() {
      registerPreviewFixtures();
      providePreviewConfig();
      registerQueryFixture(LOADING_QUERY, PENDING_QUERY);
      const loading = {
        ...args.previewComponent,
        metadataPreviewQuery: LOADING_QUERY,
      };
      return { args, loading };
    },
    template: `<div style="display:grid;gap:16px;max-width:480px">
      <preview-wrapper v-bind="args" :preview-component="loading" />
      <preview-wrapper v-bind="args" />
    </div>`,
  }),
  args: { ...Default.args },
};

export const SmallScreen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Below 48rem the preview covers the page: a back button leads the header instead of the close button.",
      },
    },
  },
  render: (args) => ({
    components: { PreviewWrapper },
    setup() {
      isCompact.value = true;
      registerPreviewFixtures();
      providePreviewConfig();
      return { args };
    },
    template: `<div style="max-width:360px"><preview-wrapper v-bind="args" /></div>`,
  }),
  args: { ...Default.args },
};
