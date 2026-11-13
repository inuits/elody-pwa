import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataValueTooltip from "../MetadataValueTooltip.vue";
import { PanelMetadataValueTooltipTypes } from "@/generated-types/queries";

const meta: Meta<typeof MetadataValueTooltip> = {
  title: "Metadata/MetadataValueTooltip",
  component: MetadataValueTooltip,
  parameters: {
    docs: {
      description: {
        component:
          "An info icon next to a value that opens extra context on hover. " +
          "The `plane` type shows only when the field config gives it a " +
          "value; the `preview` type shows a teaser of the related entity, " +
          "which needs a live API and is not shown here.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataValueTooltip>;

export const Default: Story = {
  args: {
    valueTooltip: {
      type: PanelMetadataValueTooltipTypes.Plane,
      value: "Measured on the inside of the frame.",
    } as never,
    entity: undefined as never,
  },
};
