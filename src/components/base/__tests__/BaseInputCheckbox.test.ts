import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
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

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ getModalInfo: () => ({ open: false }) }),
}));

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
});
