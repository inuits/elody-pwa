import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityImageSelection from "./EntityImageSelection.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import type { MediaFileEntity } from "@/generated-types/queries";

const CONTEXT = "storybook-image-selection";

const mediafiles = [
  {
    id: "mediafile-001",
    uuid: "mediafile-001",
    intialValues: {
      filename: "1902-C-14_voorzijde.tiff",
      mimetype: "image/tiff",
      copyrightColor: "green",
    },
  },
  {
    id: "mediafile-002",
    uuid: "mediafile-002",
    intialValues: {
      filename: "1902-C-14_keerzijde.tiff",
      mimetype: "image/tiff",
      copyrightColor: "green",
    },
  },
] as unknown as MediaFileEntity[];

// The component reads its mediafiles from the shared mediafile-selection
// state keyed by the injected viewer context; the story seeds both.
const meta: Meta<typeof EntityImageSelection> = {
  title: "Components/EntityImageSelection",
  component: EntityImageSelection,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityImageSelection },
    provide: {
      mediafileViewerContext: CONTEXT,
      entityFormData: { id: "asset-1902-c-14" },
    },
    setup() {
      const { addMediafileSelectionStateContext, setEntityMediafiles } =
        useEntityMediafileSelector();
      addMediafileSelectionStateContext(CONTEXT);
      setEntityMediafiles(CONTEXT, mediafiles);
      return { args };
    },
    template:
      '<div class="w-72 p-4"><EntityImageSelection v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityImageSelection>;

export const Default: Story = {
  args: { loading: false },
};
