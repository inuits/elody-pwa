import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImportItems from "./ImportItems.vue";
import { BaseFieldType } from "@/generated-types/queries";

// Lists importable magazine folders fetched from baseGraphql on mount. The
// mock Apollo client resolves the query with empty data, so the story renders
// the "no magazines" empty state plus the disabled start-import button.
const meta: Meta<typeof ImportItems> = {
  title: "Imports/ImportItems",
  component: ImportItems,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[480px] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ImportItems>;

export const EmptyState: Story = {
  args: {
    inputFieldType: BaseFieldType.BaseMagazineWithMetsImportField,
    closeAndDeleteForm: () => {},
  },
};
