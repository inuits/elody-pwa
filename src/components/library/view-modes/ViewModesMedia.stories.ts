import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide } from "vue";
import ViewModesMedia from "./ViewModesMedia.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

// MediaViewer reads its mediafiles from the shared mediafile-selection state,
// keyed by an injected viewer context; the story registers that context itself.
// Actual viewers (IIIF, video, ...) need a backend serving the files, so this
// renders the viewer's empty state.
const MediafileContextProvider = defineComponent({
  setup(_, { slots }) {
    const context = "storybook-media-context";
    useEntityMediafileSelector().addMediafileSelectionStateContext(context);
    provide("mediafileViewerContext", context);
    return () => slots.default?.();
  },
});

const meta: Meta<typeof ViewModesMedia> = {
  title: "Library/ViewModes/ViewModesMedia",
  component: ViewModesMedia,
  tags: ["autodocs"],
  render: (args) => ({
    components: { ViewModesMedia, MediafileContextProvider },
    setup: () => ({ args }),
    template: `
      <MediafileContextProvider>
        <div class="w-full p-4">
          <ViewModesMedia v-bind="args" />
        </div>
      </MediafileContextProvider>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof ViewModesMedia>;

export const Empty: Story = {
  args: {
    entities: [],
    entitiesLoading: false,
  },
};

export const Loading: Story = {
  args: {
    entities: [],
    entitiesLoading: true,
  },
};
