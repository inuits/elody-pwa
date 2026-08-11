import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WysiwygReadOnly from "../WysiwygReadOnly.vue";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import { SanitizeMode } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  getForm: vi.fn(),
  locale: { value: "en" },
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: mocks.getForm }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: mocks.locale }),
}));

const getDefaultProps = () => ({
  formId: "entity-1_selected",
  element: { metadataKey: "reading", label: "inscription.reading" },
  changed: false,
});

const getWrapper = (props = getDefaultProps()) =>
  shallowMount(WysiwygReadOnly, { props });

describe("WysiwygReadOnly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.locale.value = "en";
    mocks.getForm.mockReturnValue({
      values: { intialValues: { reading: "<p>Hello</p>" } },
    });
  });

  it("renders the field content read-only via SanitizedHtml", () => {
    const wrapper = getWrapper();
    const sanitizedHtml = wrapper.findComponent(SanitizedHtml);

    expect(sanitizedHtml.exists()).toBe(true);
    expect(sanitizedHtml.props("content")).toBe("<p>Hello</p>");
    expect(sanitizedHtml.props("mode")).toBe(SanitizeMode.Html);
  });

  it("resolves the content from the form registered under formId and metadataKey", () => {
    mocks.getForm.mockReturnValue({
      values: { intialValues: { reading: "<p>Other</p>", translation: "x" } },
    });
    const wrapper = getWrapper({
      ...getDefaultProps(),
      element: { metadataKey: "reading", label: "l" },
    });

    expect(wrapper.findComponent(SanitizedHtml).props("content")).toBe(
      "<p>Other</p>",
    );
  });

  it("falls back to empty content when no form is registered for formId", () => {
    mocks.getForm.mockReturnValue(undefined);
    const wrapper = getWrapper();

    expect(wrapper.findComponent(SanitizedHtml).props("content")).toBe("");
  });

  it("passes the field label to MetadataTitle", () => {
    const wrapper = getWrapper();
    const title = wrapper.findComponent(MetadataTitle);

    expect(title.exists()).toBe(true);
    expect(title.props("metadata")).toEqual(
      expect.objectContaining({ label: "inscription.reading" }),
    );
  });

  it("does not render any editable controls", () => {
    const wrapper = getWrapper();

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.find("textarea").exists()).toBe(false);
    expect(wrapper.find('[contenteditable="true"]').exists()).toBe(false);
  });

  it("shows no text label, only a neutral border, when changed is false", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), changed: false });

    expect(wrapper.text()).not.toContain("Unchanged");
    expect(wrapper.text()).not.toContain("Changed");
    expect(wrapper.classes()).toContain("border-neutral-30");
  });

  it("stays neutral regardless of colorVariant when changed is false", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      changed: false,
      colorVariant: "previous",
    });

    expect(wrapper.classes()).toContain("border-neutral-30");
    expect(wrapper.classes()).not.toContain("border-green-400");
    expect(wrapper.classes()).not.toContain("border-red-400");
  });

  it("shows the green/current styling when changed is true and colorVariant is current (or omitted)", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), changed: true });

    expect(wrapper.classes()).toContain("border-green-400");
    expect(wrapper.classes()).not.toContain("border-red-400");
  });

  it("shows the red/previous styling when changed is true and colorVariant is previous", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      changed: true,
      colorVariant: "previous",
    });

    expect(wrapper.classes()).toContain("border-red-400");
    expect(wrapper.classes()).not.toContain("border-green-400");
  });

  it("defaults changed to false when not provided", () => {
    const wrapper = shallowMount(WysiwygReadOnly, {
      props: {
        formId: "entity-1_selected",
        element: { metadataKey: "reading", label: "l" },
      },
    });

    expect(wrapper.classes()).toContain("border-neutral-30");
  });

  it("resolves the entry matching the current locale when the field value is a multilingual translations array", () => {
    mocks.locale.value = "en";
    mocks.getForm.mockReturnValue({
      values: {
        intialValues: {
          translation: [
            { key: "translation", value: "<p>Bonjour</p>", lang: "fr" },
            { key: "translation", value: "<p>Hello</p>", lang: "en" },
          ],
        },
      },
    });
    const wrapper = getWrapper({
      ...getDefaultProps(),
      element: { metadataKey: "translation", label: "l" },
    });

    expect(wrapper.findComponent(SanitizedHtml).props("content")).toBe(
      "<p>Hello</p>",
    );
  });

  it("re-resolves the translations array when the current locale changes", () => {
    mocks.locale.value = "fr";
    mocks.getForm.mockReturnValue({
      values: {
        intialValues: {
          translation: [
            { key: "translation", value: "<p>Bonjour</p>", lang: "fr" },
            { key: "translation", value: "<p>Hello</p>", lang: "en" },
          ],
        },
      },
    });
    const wrapper = getWrapper({
      ...getDefaultProps(),
      element: { metadataKey: "translation", label: "l" },
    });

    expect(wrapper.findComponent(SanitizedHtml).props("content")).toBe(
      "<p>Bonjour</p>",
    );
  });

  it("falls back to empty content when no translation entry matches the current locale", () => {
    mocks.locale.value = "de";
    mocks.getForm.mockReturnValue({
      values: {
        intialValues: {
          translation: [
            { key: "translation", value: "<p>Bonjour</p>", lang: "fr" },
            { key: "translation", value: "<p>Hello</p>", lang: "en" },
          ],
        },
      },
    });
    const wrapper = getWrapper({
      ...getDefaultProps(),
      element: { metadataKey: "translation", label: "l" },
    });

    expect(wrapper.findComponent(SanitizedHtml).props("content")).toBe("");
  });

  describe("info panel trigger suppression", () => {
    const elementWithInfoPanel = () => ({
      metadataKey: "reading",
      label: "inscription.reading",
      infoPanel: {
        title: "metadata.conventions.title",
        content: "<p>conventions</p>",
      },
    });

    it("never renders the info panel trigger, even when the element carries a truthy infoPanel.content", () => {
      const wrapper = shallowMount(WysiwygReadOnly, {
        props: { ...getDefaultProps(), element: elementWithInfoPanel() },
        global: { stubs: { MetadataTitle: false } },
      });

      expect(
        wrapper.find('[data-testid="info-panel-trigger"]').exists(),
      ).toBe(false);
    });

    it("passes a metadata object to MetadataTitle with infoPanel stripped", () => {
      const wrapper = getWrapper({
        ...getDefaultProps(),
        element: elementWithInfoPanel(),
      });
      const title = wrapper.findComponent(MetadataTitle);

      expect(title.props("metadata").infoPanel).toBeFalsy();
      expect(title.props("metadata")).toEqual(
        expect.objectContaining({ label: "inscription.reading" }),
      );
    });
  });
});
