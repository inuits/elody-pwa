import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import BasePagination from "./BasePagination.vue";
import {
  createPaginationStore,
  PaginationStoreKey,
} from "@/components/library/usePaginationStore";

const meta: Meta<typeof BasePagination> = {
  title: "Base/BasePagination",
  component: BasePagination,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof BasePagination>;

// The component reads its state from an injected pagination store, so each
// story provides a freshly created store with a fixture total.
const withStore = (totalAmount: number) => () => ({
  components: { BasePagination },
  setup() {
    const store = createPaginationStore();
    store.updateTotalAmount(totalAmount);
    provide(PaginationStoreKey, store);
  },
  template: '<div class="p-4"><BasePagination /></div>',
});

export const Default: Story = {
  render: withStore(187),
};

export const SinglePage: Story = {
  render: withStore(12),
};
