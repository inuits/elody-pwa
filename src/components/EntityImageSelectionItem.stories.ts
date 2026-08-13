import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityImageSelectionItem from "./EntityImageSelectionItem.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import type { MediaFileEntity } from "@/generated-types/queries";

const CONTEXT = "storybook-image-selection-item";

const mediafile = {
  id: "mediafile-001",
  uuid: "mediafile-001",
  intialValues: {
    filename: "1902-C-14_detail_signatuur.jpg",
    mimetype: "image/jpeg",
    copyrightColor: "green",
  },
} as unknown as MediaFileEntity;

// Needs the parent-provided mediafile viewer context and entity form data;
// the story provides both. Without a IIIF backend the thumbnail request
// fails and the item falls back to its mimetype icon.
const meta: Meta<typeof EntityImageSelectionItem> = {
  title: "Components/EntityImageSelectionItem",
  component: EntityImageSelectionItem,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityImageSelectionItem },
    provide: {
      mediafileViewerContext: CONTEXT,
      entityFormData: { id: "asset-1902-c-14" },
    },
    setup() {
      const { addMediafileSelectionStateContext } =
        useEntityMediafileSelector();
      addMediafileSelectionStateContext(CONTEXT);
      return { args };
    },
    template:
      '<div class="w-40 p-4"><EntityImageSelectionItem v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityImageSelectionItem>;

export const Default: Story = {
  args: { mediafile },
};
