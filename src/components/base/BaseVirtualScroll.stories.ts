import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseVirtualScroll from "./BaseVirtualScroll.vue";

type CollectionRow = { id: string; title: string; objectNumber: string };

const items: CollectionRow[] = Array.from({ length: 500 }, (_, i) => ({
  id: `entity-${i + 1}`,
  title: `Aquarel zonder titel #${i + 1}`,
  objectNumber: `OBJ-2024-${String(i + 1).padStart(4, "0")}`,
}));

const meta: Meta<typeof BaseVirtualScroll> = {
  title: "Base/BaseVirtualScroll",
  component: BaseVirtualScroll,
  tags: ["autodocs"],
  render: (args) => ({
    components: { BaseVirtualScroll },
    setup: () => ({ args }),
    template: `
      <div class="w-96 p-4">
        <BaseVirtualScroll v-bind="args">
          <template #default="{ item, index, style }">
            <div
              :style="style"
              class="border-b border-neutral-30 px-3 py-2 text-sm text-text-body"
            >
              <p class="font-bold">{{ item.title }}</p>
              <p class="text-text-light">{{ item.objectNumber }}</p>
            </div>
          </template>
        </BaseVirtualScroll>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseVirtualScroll>;

export const FiveHundredRows: Story = {
  args: {
    items,
    itemSize: 62,
    height: "320px",
  },
};

export const ShortList: Story = {
  args: {
    items: items.slice(0, 3),
    itemSize: 62,
    height: "320px",
  },
};
