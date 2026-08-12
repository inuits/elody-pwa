import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataValueTooltipPreview from "./MetadataValueTooltipPreview.vue";
import { Entitytyping, type BaseEntity } from "@/generated-types/queries";

// The component fetches the full entity (thumbnail + teaser metadata) by id on
// mount. Storybook's Apollo mock resolves every query to empty data, so this
// renders the component's empty state; the entity fixture shows the intended
// input shape.
const entity = {
  __typename: "Manifestation",
  id: "manifestation-1",
  uuid: "manifestation-1",
  type: Entitytyping.Manifestation,
  teaserMetadata: {},
  intialValues: {},
} as unknown as BaseEntity;

const meta: Meta<typeof MetadataValueTooltipPreview> = {
  title: "Metadata/MetadataValueTooltipPreview",
  component: MetadataValueTooltipPreview,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof MetadataValueTooltipPreview>;

export const EmptyState: Story = {
  args: {
    entity,
  },
};
