import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { reactive } from "vue";
import BaseInputCheckbox from "../BaseInputCheckbox.vue";

const modalState = reactive({ BulkOperations: { open: false } });

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: (type: string) => (modalState as any)[type],
  }),
}));

vi.mock("@/main", () => ({ bulkSelectAllSizeLimit: 100 }));

vi.mock("vue-router", () => ({ useRoute: () => ({ name: "Users" }) }));

describe("BaseInputCheckbox", () => {
  // a plain form/filter checkbox (BooleanFilter.vue) passes no item
  it("survives the bulk operations modal opening without an item", async () => {
    const errors: unknown[] = [];
    mount(BaseInputCheckbox, {
      props: {
        modelValue: false,
        bulkOperationsContext: undefined,
        inputStyle: "accentNormal",
        ignoreBulkOperations: true,
      },
      global: {
        mocks: { $t: (key: string) => key },
        config: { errorHandler: (error: unknown) => errors.push(error) },
      },
    });

    modalState.BulkOperations.open = true;
    await flushPromises();

    expect(errors).toEqual([]);
  });
});
