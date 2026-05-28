import { mount } from "@vue/test-utils";
import MetadataFormatter from "../MetadataFormatter.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/main", () => ({
  formattersSettings: { pill: {} },
}));

vi.mock("@/helpers", () => ({
  convertUnitToReadbleFormat: vi.fn().mockImplementation((_unit, value) => value ?? ""),
  stringIsUrl: vi.fn().mockReturnValue(false),
  stringIsHtml: vi.fn().mockReturnValue(false),
}));

const mocks = vi.hoisted(() => ({ t: vi.fn() }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mocks.t }),
}));

describe("MetadataFormatter", () => {
  describe("translateArrayValuesAndJoin", () => {
    it("translates each array element and joins with comma", async () => {
      mocks.t.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          "metadata.labels.user-function.programmer": "Programmator",
          "metadata.labels.user-function.technician": "Technieker",
        };
        return translations[key] ?? key;
      });

      const wrapper = mount(MetadataFormatter, {
        props: {
          formatter: "pill",
          label: ["programmer", "technician"],
          translationKey: "metadata.labels.user-function.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("Programmator, Technieker");
    });

    it("falls back to raw value when translation key has no match", async () => {
      mocks.t.mockImplementation((key: string) => key);

      const wrapper = mount(MetadataFormatter, {
        props: {
          formatter: "pill",
          label: ["programmer", "technician"],
          translationKey: "metadata.labels.user-function.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("programmer, technician");
    });

    it("joins raw values without translation when no translationKey", async () => {
      const wrapper = mount(MetadataFormatter, {
        props: {
          formatter: "pill",
          label: ["programmer", "technician"],
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("programmer, technician");
    });

    it("returns dash for empty array", async () => {
      const wrapper = mount(MetadataFormatter, {
        props: {
          formatter: "pill",
          label: [],
          translationKey: "metadata.labels.user-function.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("-");
    });
  });
});
