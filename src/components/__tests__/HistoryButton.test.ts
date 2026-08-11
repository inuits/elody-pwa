import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import HistoryButton from "@/components/HistoryButton.vue";

const mockRouterPush = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mountComponent = (props = {}) =>
  shallowMount(HistoryButton, {
    props: {
      entityType: "inscription",
      entityId: "I-12345",
      ...props,
    },
  });

describe("HistoryButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to the HistoryComparison route for the given entity on click", async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent(BaseButtonNew).vm.$emit("click");

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: "HistoryComparison",
      params: { type: "inscription", id: "I-12345" },
    });
  });

  it("labels the button with the history translation key", () => {
    const wrapper = mountComponent();

    expect(wrapper.findComponent(BaseButtonNew).props("label")).toBe(
      "history.view-history",
    );
  });
});
