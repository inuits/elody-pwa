import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount, shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "Home" }),
}));

vi.mock("@/main", () => ({
  bulkSelectAllSizeLimit: 500,
}));

vi.mock("@/generated-types/queries", () => ({
  TypeModals: { BulkOperations: "BulkOperations" },
}));

const modalState = vi.hoisted(() => ({ BulkOperations: { open: false } }));

vi.mock("@/composables/useBaseModal", async () => {
  const { reactive } = await import("vue");
  const state = reactive(modalState);
  return {
    useBaseModal: () => ({
      getModalInfo: (type: keyof typeof modalState) => state[type],
    }),
    modalStateForTest: state,
  };
});

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => ({
    contextWhereSelectionEventIsTriggered: ref(undefined),
    enqueueItemForBulkProcessing: vi.fn(),
    dequeueItemForBulkProcessing: vi.fn(),
    isEnqueued: () => false,
    getEnqueuedItemCount: () => 0,
    isBulkSelectionLimitReached: () => false,
  }),
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(BaseInputCheckbox, {
    props: {
      modelValue: false,
      item: { id: "1" },
      bulkOperationsContext: undefined,
      ignoreBulkOperations: true,
      ...props,
    },
    global: { stubs: { unicon: true } },
  });

describe("BaseInputCheckbox", () => {
  it("renders a real checkbox input", () => {
    expect(getWrapper().find('input[type="checkbox"]').exists()).toBe(true);
  });

  it("checks in commit teal", () => {
    expect(getWrapper().find("input").classes()).toContain("accent-commit");
  });

  it("borders the checked state in commit teal", () => {
    expect(getWrapper().find("input").classes()).toContain(
      "checked:border-commit",
    );
  });

  it("names itself via aria-label when there is no visible label", () => {
    expect(
      getWrapper({ ariaLabel: "Selecteer rij" })
        .find("input")
        .attributes("aria-label"),
    ).toBe("Selecteer rij");
  });

  it("links the visible label to the input", () => {
    const wrapper = getWrapper({ label: "Monografie" });
    expect(wrapper.find("label").attributes("for")).toBe(
      wrapper.find("input").attributes("id"),
    );
  });

  it("keeps its click from reaching the parent row", async () => {
    const parentClick = vi.fn();
    const wrapper = mount(
      {
        components: { BaseInputCheckbox },
        template: `<div @click="parentClick"><BaseInputCheckbox :model-value="false" :item="{ id: '1' }" :bulk-operations-context="undefined" ignore-bulk-operations /></div>`,
        methods: { parentClick },
      },
      { global: { stubs: { unicon: true } } },
    );
    await wrapper.find(".w-10").trigger("click");
    expect(parentClick).not.toHaveBeenCalled();
  });

  // a plain form/filter checkbox (BooleanFilter.vue) passes no item
  it("survives the bulk operations modal opening without an item", async () => {
    const errors: unknown[] = [];
    shallowMount(BaseInputCheckbox, {
      props: {
        modelValue: false,
        bulkOperationsContext: undefined,
        ignoreBulkOperations: true,
      } as any,
      global: {
        stubs: { unicon: true },
        config: { errorHandler: (error: unknown) => errors.push(error) },
      },
    });

    const { modalStateForTest } = (await import(
      "@/composables/useBaseModal"
    )) as any;
    modalStateForTest.BulkOperations.open = true;
    await flushPromises();

    expect(errors).toEqual([]);
  });
});
