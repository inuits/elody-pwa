import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, inject, nextTick, provide } from "vue";
import {
  createPaginationStore,
  PaginationStoreKey,
  type PaginationStore,
} from "../usePaginationStore";

const DummyConsumer = defineComponent({
  setup() {
    const store = inject(PaginationStoreKey) as PaginationStore;
    if (!store) throw new Error("Store not provided!");

    return { store };
  },
  template: `
    <div>
      <span data-test="current-page">{{ store.currentPage }}</span>
      <span data-test="skip">{{ store.skip }}</span>
      <span data-test="last-page">{{ store.getLastPage() }}</span>
      
      <button data-test="btn-next" @click="store.next()">Next</button>
      <button data-test="btn-prev" @click="store.previous()">Prev</button>
      <button data-test="btn-go" @click="store.goToPage(3)">Go to 3</button>
    </div>
  `,
});

const DummyProvider = defineComponent({
  components: { DummyConsumer },
  props: {
    initialTotal: { type: Number, default: 100 },
    initialLimit: { type: Number, default: 20 },
  },
  setup(props) {
    const store = createPaginationStore();

    store.updateTotalAmount(props.initialTotal);
    store.setLimit(props.initialLimit);

    provide(PaginationStoreKey, store);

    return { store };
  },
  template: `<DummyConsumer />`,
});

describe("Pagination Store - Vue Integration", () => {
  const mountIntegration = (props = {}) => {
    return mount(DummyProvider, { props });
  };

  it("successfully passes state from provider to consumer via inject", () => {
    const wrapper = mountIntegration({ initialTotal: 80, initialLimit: 20 });

    expect(wrapper.find('[data-test="last-page"]').text()).toBe("4");
    expect(wrapper.find('[data-test="current-page"]').text()).toBe("1");
  });

  it("updates the provided store when consumer triggers next()", async () => {
    const wrapper = mountIntegration();
    const store = wrapper.vm.store;

    await wrapper.find('[data-test="btn-next"]').trigger("click");

    expect(wrapper.find('[data-test="current-page"]').text()).toBe("2");
    expect(wrapper.find('[data-test="skip"]').text()).toBe("2");

    expect(store.currentPage.value).toBe(2);
  });

  it("updates the provided store when consumer triggers previous()", async () => {
    const wrapper = mountIntegration();
    const store = wrapper.vm.store;

    store.goToPage(3);
    await nextTick();

    await wrapper.find('[data-test="btn-prev"]').trigger("click");

    expect(wrapper.find('[data-test="current-page"]').text()).toBe("2");
    expect(store.currentPage.value).toBe(2);
  });

  it("updates the provided store when consumer triggers goToPage()", async () => {
    const wrapper = mountIntegration();
    const store = wrapper.vm.store;

    await wrapper.find('[data-test="btn-go"]').trigger("click");

    expect(wrapper.find('[data-test="current-page"]').text()).toBe("3");
    expect(store.currentPage.value).toBe(3);
  });

  it("reacts automatically in the consumer if the provider changes the total amount", async () => {
    const wrapper = mountIntegration({ initialTotal: 100, initialLimit: 20 });
    const store = wrapper.vm.store;

    store.goToPage(5);
    await nextTick();
    expect(wrapper.find('[data-test="current-page"]').text()).toBe("5");

    store.updateTotalAmount(20);
    await nextTick();

    expect(wrapper.find('[data-test="current-page"]').text()).toBe("1");
    expect(wrapper.find('[data-test="last-page"]').text()).toBe("1");
  });
});
