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

  describe("diff variants", () => {
    it("strikes the old value in muted ink, with a spoken 'was' prefix", () => {
      mocks.t.mockImplementation((key: string) => key);
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill|modified", label: "Lannoo" },
      });
      const pill = wrapper.get("div");
      expect(pill.classes()).toContain("pill--diff-old");
      // The strike is not the only signal (history-diff.md).
      expect(pill.text()).toContain("was");
      expect(pill.attributes("style")).toBeUndefined();
    });

    it("marks the new value with the changed tint, spoken as 'nu'", () => {
      mocks.t.mockImplementation((key: string) => key);
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill|added", label: "Standaard Uitgeverij" },
      });
      const pill = wrapper.get("div");
      expect(pill.classes()).toContain("pill--diff-new");
      expect(pill.text()).toContain("nu");
      expect(pill.attributes("style")).toBeUndefined();
    });
  });

  describe("colours", () => {
    it("takes the relation-chip tokens for an auto pill, not a hard-coded fill", () => {
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill|auto", label: "Jan Persoon" },
      });
      const pill = wrapper.get("div");
      expect(pill.classes()).toContain("pill--relation");
      // The fill is the token, so nothing is written inline.
      expect(pill.attributes("style")).toBeUndefined();
    });

    it("keeps client-configured colours inline — those are config, not design", () => {
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill", label: "concept" },
      });
      const style = wrapper.get("div").attributes("style");
      expect(style).toContain("background: rgb(170, 170, 170)");
      expect(style).toContain("color: rgb(255, 255, 255)");
    });

    it("stays unstyled when the client configured no group for the formatter", () => {
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "badge", label: "concept" },
      });
      expect(wrapper.get("div").classes()).not.toContain("pill");
    });

    it("stays unstyled when the client configured no colours for the value", () => {
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill", label: "unconfigured-value" },
      });
      const pill = wrapper.get("div");
      expect(pill.classes()).not.toContain("pill");
      expect(pill.attributes("style")).toBeUndefined();
    });
  });
});
