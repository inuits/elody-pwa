import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide, watch } from "vue";
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
          "The pager in a list's results band: first and previous page, a " +
          "page box that jumps on Enter or blur, the number of pages, then " +
          "next and last page. Edge buttons are real disabled buttons on the " +
          'first and last page. A capped total reads "of 50+" with a help ' +
          "tooltip.",
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

/** Mid-list: every step is available. */
export const Default: Story = { render: () => withStore(5) };

/** First page — the « and ‹ steps are disabled rather than hidden. */
export const FirstPage: Story = { render: () => withStore(1) };

/** Last page — the › and » steps are disabled. */
export const LastPage: Story = { render: () => withStore(12) };

/** Two pages. */
export const FewPages: Story = { render: () => withStore(2, 60) };

/** Capped total: the real count is unknown, so the last page reads "50+". */
export const Capped: Story = { render: () => withStore(3, 1001) };

const PagerAt = defineComponent({
  components: { BasePagination },
  props: {
    page: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  setup(props) {
    const store = createPaginationStore();
    store.updateTotalAmount(props.total);
    store.goToPage(props.page);
    provide(PaginationStoreKey, store);
  },
  template: `<base-pagination />`,
});

/** Middle, first, last page and a capped total, one under the other. */
export const States: Story = {
  render: () => ({
    components: { PagerAt },
    setup: () => ({
      rows: [
        { label: "Middle page", page: 5, total: 240 },
        { label: "First page", page: 1, total: 240 },
        { label: "Last page", page: 12, total: 240 },
        { label: "Capped total", page: 3, total: 1001 },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:120px max-content;gap:12px 16px;align-items:center;font-size:var(--text-label)">
        <template v-for="row in rows" :key="row.label">
          <span>{{ row.label }}</span>
          <pager-at :page="row.page" :total="row.total" />
        </template>
      </div>`,
  }),
};

export const Playground: StoryObj<{ page: number; total: number }> = {
  args: { page: 5, total: 240 },
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    total: { control: { type: "number", min: 0, step: 10 } },
  },
  render: (args) => ({
    components: { BasePagination },
    setup() {
      const store = createPaginationStore();
      provide(PaginationStoreKey, store);
      watch(
        () => [args.total, args.page],
        () => {
          store.updateTotalAmount(args.total);
          store.goToPage(args.page);
        },
        { immediate: true },
      );
    },
    template: `<div style="max-width:640px"><base-pagination /></div>`,
  }),
};
