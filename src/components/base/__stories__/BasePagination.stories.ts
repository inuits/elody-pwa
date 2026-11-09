import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import BasePagination from "../BasePagination.vue";
import {
  createPaginationStore,
  PaginationStoreKey,
} from "@/components/library/usePaginationStore";

const meta: Meta<typeof BasePagination> = {
  // Story id base-basepagination--default, per MANIFEST.md.
  title: "Base/BasePagination",
  component: BasePagination,
  parameters: {
    docs: {
      description: {
        component:
          "Page size on the left, pager on the right. Pages are numbered " +
          "rather than typed into a box: the numbers are the affordance, and " +
          "they are real buttons, so the pager can be tabbed through and the " +
          "current page announces itself. The first and last page stay " +
          "reachable from anywhere; runs in between collapse to an ellipsis.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BasePagination>;

/** Feeds the pager a store sitting on the given page of a 240-result list. */
const withStore = (page: number, total = 240) => ({
  components: { BasePagination },
  setup() {
    const store = createPaginationStore();
    store.updateTotalAmount(total);
    store.goToPage(page);
    provide(PaginationStoreKey, store);
  },
  template: `<div style="max-width:640px"><base-pagination /></div>`,
});

/** Mid-list: a gap on either side of the current page. */
export const Default: Story = { render: () => withStore(5) };

/** First page — the ‹ step is disabled rather than hidden. */
export const FirstPage: Story = { render: () => withStore(1) };

/** Last page — the › step is disabled. */
export const LastPage: Story = { render: () => withStore(12) };

/** Few enough pages that none need eliding. */
export const FewPages: Story = { render: () => withStore(2, 60) };
