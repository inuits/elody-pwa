import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide } from "vue";
import MetadataFormatter from "./MetadataFormatter.vue";
import { RouteNames } from "@/generated-types/queries";

// MetadataFormatterLink (rendered for the "link|..." formatter) resolves auth
// requirements from the app config's router configuration, so link stories
// provide a minimal config with an empty Home route.
const ConfigProvider = defineComponent({
  setup(_, { slots }) {
    provide("config", {
      customization: {},
      routerConfig: [{ name: RouteNames.Home, children: [] }],
    });
    return () => slots.default?.();
  },
});

const meta: Meta<typeof MetadataFormatter> = {
  title: "Metadata/MetadataFormatter",
  component: MetadataFormatter,
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

type Story = StoryObj<typeof MetadataFormatter>;

export const Pill: Story = {
  args: {
    formatter: "pill|auto",
    label: "published",
  },
};

export const Link: Story = {
  args: {
    formatter: "link|",
    label: "Portrait of a Lady with a Fan",
    link: "https://www.example-museum.org/collection/SK-A-1234",
    entity: { type: "asset" },
    openInNewTab: true,
  },
};

export const RegexpMatch: Story = {
  args: {
    formatter: "regexpMatch|",
    label: "SK-A-1234 (1660)",
  },
};

export const ArrayValue: Story = {
  args: {
    formatter: "pill|auto",
    label: ["oil paint", "canvas"],
  },
};

export const EmptyLabel: Story = {
  args: {
    formatter: "pill|auto",
    label: [],
  },
};
