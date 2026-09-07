import { mount } from "@vue/test-utils";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stringIsUrl, stringIsHtml } from "@/helpers";

vi.mock(import("@/helpers"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    convertUnitToReadbleFormat: vi
      .fn()
      .mockImplementation((_unit, value) => value ?? ""),
    stringIsUrl: vi.fn(),
    stringIsHtml: vi.fn(),
  };
});

const mocks = vi.hoisted(() => {
  return {
    t: vi.fn(),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mocks.t,
  }),
}));

vi.mock("@/components/CustomIcon.vue", () => ({
  default: {
    template: "<span></span>",
  },
}));

describe("EntityElementMetadata", () => {
  beforeEach(() => {
    stringIsUrl.mockReturnValue(false);
    stringIsHtml.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Translation functionality", () => {
    it("should replace $value with readableValue when translationKey is provided", async () => {
      mocks.t.mockReturnValue("Translated: test");
      const wrapper = mount(EntityElementMetadata, {
        props: { value: "test", translationKey: "translated.value.$value" },
      });
      await nextTick();
      expect(wrapper.find('[data-cy="metadata-value"]').text()).toBe(
        "Translated: test",
      );
    });

    it("should replace $value with boolean value when translationKey is provided", async () => {
      mocks.t.mockReturnValue("Positive");
      const wrapper = mount(EntityElementMetadata, {
        props: { value: true, translationKey: "translated.booleans.$value" },
      });
      await nextTick();
      expect(wrapper.find('[data-cy="metadata-value"]').text()).toBe(
        "Positive",
      );
    });

    it("should return initial value if it's an array and when translationKey is provided", async () => {
      mocks.t.mockReturnValue("Positive");
      const wrapper = mount(EntityElementMetadata, {
        props: { value: [1, 2], translationKey: "translated.booleans.$value" },
      });
      await nextTick();
      expect(
        wrapper
          .findAll('[data-cy="metadata-value"]')
          .map((item) => item.text()),
      ).toStrictEqual(["1", "2"]);
    });

    it("should fallback to readableValue when translation is not found", async () => {
      mocks.t.mockReturnValue("missing.translation.opened");
      const wrapper = mount(EntityElementMetadata, {
        props: {
          value: "opened",
          translationKey: "missing.translation.$value",
        },
      });
      await nextTick();
      expect(wrapper.find('[data-cy="metadata-value"]').text()).toBe("opened");
    });

    it('should show "-" when readableValue is empty and no translation exists', async () => {
      const wrapper = mount(EntityElementMetadata, {
        props: { value: "", translationKey: "some.key.$value" },
      });
      await nextTick();
      expect(wrapper.find('[data-cy="metadata-value"]').text()).toBe("-");
    });
  });

  describe("Other display scenarios", () => {
    it("should show coordinates correctly", async () => {
      const wrapper = mount(EntityElementMetadata, {
        props: { value: { latitude: 40.7128, longitude: -74.006 } },
      });
      await nextTick();
      expect(wrapper.text()).toContain("(40.7128, -74.006)");
    });

    it("should show customValue when provided", async () => {
      const wrapper = mount(EntityElementMetadata, {
        props: { customValue: "Custom content" },
      });
      await nextTick();
      expect(wrapper.text()).toContain("Custom content");
    });

    it("should handle array values", async () => {
      const wrapper = mount(EntityElementMetadata, {
        props: { value: ["test1", "test2"] },
      });
      await nextTick();
      expect(wrapper.findAll('[data-cy="metadata-value"]')[0].text()).toBe(
        "test1",
      );
      expect(wrapper.findAll('[data-cy="metadata-value"]')[1].text()).toBe(
        "test2",
      );
    });

    it('should show "-" when value is an empty array', async () => {
      const wrapper = mount(EntityElementMetadata, { props: { value: [] } });
      await nextTick();
      expect(wrapper.text()).toBe("-");
    });
  });

  describe("Multiline text values", () => {
    it("should render each newline-separated URL as its own link", async () => {
      stringIsUrl.mockImplementation((value: unknown) =>
        typeof value === "string" && value.startsWith("https://"),
      );
      const wrapper = mount(EntityElementMetadata, {
        props: {
          value:
            "https://diconab.huma-num.fr/inscriptions/73\nhttps://ociana.osu.edu/inscriptions/14022",
        },
      });
      await nextTick();
      const links = wrapper.findAll("a");
      expect(links).toHaveLength(2);
      expect(links[0].attributes("href")).toBe(
        "https://diconab.huma-num.fr/inscriptions/73",
      );
      expect(links[1].attributes("href")).toBe(
        "https://ociana.osu.edu/inscriptions/14022",
      );
    });

    it("should render non-url lines as plain text alongside links", async () => {
      stringIsUrl.mockImplementation((value: unknown) =>
        typeof value === "string" && value.startsWith("https://"),
      );
      const wrapper = mount(EntityElementMetadata, {
        props: {
          value: "see also\nhttps://ociana.osu.edu/inscriptions/14022",
        },
      });
      await nextTick();
      const links = wrapper.findAll("a");
      expect(links).toHaveLength(1);
      expect(wrapper.find('[data-cy="metadata-value"]').text()).toBe(
        "see also",
      );
    });

    it("should not split a single-line value into the multi-line renderer", async () => {
      stringIsUrl.mockReturnValue(true);
      const wrapper = mount(EntityElementMetadata, {
        props: { value: "https://diconab.huma-num.fr/inscriptions/73" },
      });
      await nextTick();
      const links = wrapper.findAll("a");
      expect(links).toHaveLength(1);
      expect(links[0].attributes("href")).toBe(
        "https://diconab.huma-num.fr/inscriptions/73",
      );
    });
  });
});
