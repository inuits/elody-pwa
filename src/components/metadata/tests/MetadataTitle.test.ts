import { describe, it, expect, beforeEach, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import MetadataTitle from "../MetadataTitle.vue";

const mocks = vi.hoisted(() => ({
  openPanel: vi.fn(),
}));

vi.mock("@/composables/useInfoPanel", () => ({
  useInfoPanel: () => ({
    openPanel: mocks.openPanel,
    closePanel: vi.fn(),
  }),
}));

const uniconStub = {
  template: '<div data-testid="unicon" :aria-label="name"></div>',
  props: ["height", "name"],
};

const getWrapper = (metadata: Record<string, any>) =>
  shallowMount(MetadataTitle, {
    props: { metadata } as any,
    global: { stubs: { unicon: uniconStub } },
  });

describe("MetadataTitle - info panel trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the info-panel trigger when infoPanel config is absent", () => {
    const wrapper = getWrapper({ label: "metadata.labels.reading" });
    expect(wrapper.find('[data-testid="info-panel-trigger"]').exists()).toBe(
      false,
    );
  });

  it("renders the info-panel trigger when infoPanel config has content", () => {
    const wrapper = getWrapper({
      label: "metadata.labels.reading",
      infoPanel: {
        title: "metadata.conventions.title",
        content: "<p>conventions</p>",
      },
    });
    expect(wrapper.find('[data-testid="info-panel-trigger"]').exists()).toBe(
      true,
    );
  });

  it("does not render the trigger when infoPanel has no content", () => {
    const wrapper = getWrapper({
      label: "metadata.labels.reading",
      infoPanel: { title: "metadata.conventions.title", content: "" },
    });
    expect(wrapper.find('[data-testid="info-panel-trigger"]').exists()).toBe(
      false,
    );
  });

  it("opens the panel with the configured title and content when clicked", async () => {
    const wrapper = getWrapper({
      label: "metadata.labels.reading",
      infoPanel: {
        title: "metadata.conventions.title",
        content: "<p>conventions</p>",
      },
    });
    await wrapper.find('[data-testid="info-panel-trigger"]').trigger("click");
    expect(mocks.openPanel).toHaveBeenCalledWith({
      title: "metadata.conventions.title",
      content: "<p>conventions</p>",
    });
  });

  it("still renders the hover tooltip when a tooltip is configured", () => {
    const wrapper = getWrapper({
      label: "metadata.labels.reading",
      tooltip: "metadata.tooltips.reading",
    });
    expect(wrapper.findComponent({ name: "BaseTooltip" }).exists()).toBe(true);
  });
});

describe("MetadataTitle - field-row label", () => {
  const title = (props: Record<string, unknown> = {}) =>
    shallowMount(MetadataTitle, {
      props: { metadata: { label: "metadata.labels.title" }, ...props } as any,
      global: { stubs: { unicon: uniconStub } },
    });

  it("renders the label at the label size, bold, in field-label ink", () => {
    expect(title().find('[data-cy="metadata-label"]').classes()).toEqual(
      expect.arrayContaining(["text-label", "font-bold", "text-text-field-label"]),
    );
  });

  it("marks a required field with an asterisk in danger ink", () => {
    const marker = title({ isFieldRequired: true }).find('[data-cy="required-marker"]');
    expect(marker.text()).toBe("*");
    expect(marker.classes()).toContain("text-danger");
  });

  it("shows no required marker for an optional field", () => {
    expect(title().find('[data-cy="required-marker"]').exists()).toBe(false);
  });

  it("marks one-of-required fields with a ring marker named by the group rule", () => {
    const marker = title({ isOneOfRequired: true }).find(
      '[data-cy="one-of-required-marker"]',
    );
    expect(marker.text()).toBe("◦");
    expect(marker.attributes("aria-label")).toBe("metadata.labels.one-of-required");
  });
});
