import { mount } from "@vue/test-utils";
import MetadataFormatterPill from "../MetadataFormatterPill.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/main", () => ({
  formattersSettings: {
    pill: {
      concept: { background: "#aaa", text: "#fff" },
    },
  },
}));

const mocks = vi.hoisted(() => ({ t: vi.fn() }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mocks.t }),
}));

describe("MetadataFormatterPill", () => {
  describe("displayValue", () => {
    it("shows raw label when no translationKey", async () => {
      mocks.t.mockReturnValue("metadata.labels.production-status.concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill", label: "concept" },
      });
      await nextTick();
      expect(wrapper.text()).toBe("concept");
    });

    it("translates when translationKey is a direct i18n key (option label style)", async () => {
      mocks.t.mockReturnValue("Concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "metadata.labels.production-status.concept",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("Concept");
      expect(mocks.t).toHaveBeenCalledWith(
        "metadata.labels.production-status.concept",
      );
    });

    it("translates when translationKey contains $value placeholder", async () => {
      mocks.t.mockReturnValue("Concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "production-status.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("Concept");
      expect(mocks.t).toHaveBeenCalledWith("production-status.concept");
    });

    it("falls back to raw label when translationKey has no match", async () => {
      mocks.t.mockReturnValue("production-status.concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "production-status.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("concept");
    });
  });
});
