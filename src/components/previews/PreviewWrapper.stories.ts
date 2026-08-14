import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PreviewWrapper from "./PreviewWrapper.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import {
  ListItemCoverageTypes,
  PreviewTypes,
  type Entity,
  type Entitytyping,
  type PreviewComponent,
} from "@/generated-types/queries";

// The preview pane host: it renders the header (close button / title /
// open-detail-page) and dispatches to the configured preview type. ColumnList
// and History previews fetch their column configuration from baseGraphql, so
// the stories use the MediaViewer type, which is driven by props alone.
const mediaViewerPreview = {
  type: PreviewTypes.MediaViewer,
  listItemsCoverage: ListItemCoverageTypes.OneListItem,
  previewQuery: undefined,
  metadataPreviewQuery: undefined,
} as unknown as PreviewComponent;

const entities = [
  {
    id: "entity-1",
    uuid: "entity-1",
    type: "mediafile",
    intialValues: { title: "Scan of front cover" },
  },
] as unknown as Entity[];

const meta: Meta<typeof PreviewWrapper> = {
  title: "Previews/PreviewWrapper",
  component: PreviewWrapper,
  tags: ["autodocs"],
  render: (args) => ({
    components: { PreviewWrapper },
    setup: () => {
      // register the default mediafile viewer context used by MediaViewerNew
      useEntityMediafileSelector().addMediafileSelectionStateContext("");
      return { args };
    },
    template:
      '<div class="w-[720px] p-4"><PreviewWrapper v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof PreviewWrapper>;

export const MediaViewerLoading: Story = {
  args: {
    previewComponent: mediaViewerPreview,
    entityType: "mediafile" as Entitytyping,
    entities,
    entitiesLoading: true,
    configPerViewMode: {},
    entityId: "entity-1",
    parentIds: ["parent-1"],
    cropMediafileCoordinatesKey: "",
  },
};

export const MediaViewerWithOpenDetailButton: Story = {
  args: {
    previewComponent: {
      ...mediaViewerPreview,
      previewConfiguration: { displayOpenDetailPageButton: true },
    } as unknown as PreviewComponent,
    entityType: "mediafile" as Entitytyping,
    entities,
    entitiesLoading: true,
    configPerViewMode: {},
    entityId: "entity-1",
    parentIds: ["parent-1"],
    cropMediafileCoordinatesKey: "",
  },
};
