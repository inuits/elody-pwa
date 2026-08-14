import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide } from "vue";
import MetadataFormatterLink from "./MetadataFormatterLink.vue";
import { RouteNames } from "@/generated-types/queries";

// The component resolves auth requirements from the app config's router
// configuration (children of the Home route), so stories provide a minimal
// config with an empty Home route: no entity requires auth, links render as <a>.
const ConfigProvider = defineComponent({
  setup(_, { slots }) {
    provide("config", {
      customization: {},
      routerConfig: [{ name: RouteNames.Home, children: [] }],
    });
    return () => slots.default?.();
  },
});

const meta: Meta<typeof MetadataFormatterLink> = {
  title: "Metadata/MetadataFormatterLink",
  component: MetadataFormatterLink,
  tags: ["autodocs"],
  decorators: [
    () => ({
      components: { ConfigProvider },
      template:
        '<ConfigProvider><div class="w-96 p-4"><story /></div></ConfigProvider>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof MetadataFormatterLink>;

export const Default: Story = {
  args: {
    label: "Portrait of a Lady with a Fan",
    link: "https://www.example-museum.org/collection/SK-A-1234",
    type: "asset",
    openInNewTab: false,
  },
};

export const OpensInNewTab: Story = {
  args: {
    label: "IIIF manifest",
    link: "https://www.example-museum.org/iiif/SK-A-1234/manifest.json",
    type: "mediafile",
    openInNewTab: true,
  },
};
