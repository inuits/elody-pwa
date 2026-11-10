import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityElementWrapper from "../EntityElementWrapper.vue";
import { BaseLibraryModes } from "@/generated-types/queries";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const CLOSE_SELECTOR = '[data-cy="close-preview-component"]';

const BaseTooltipStub = {
  template:
    '<div class="base-tooltip-stub"><slot name="activator" :on="{}" /><slot /></div>',
};

const stubs = {
  BaseTooltip: BaseTooltipStub,
  "base-tooltip": BaseTooltipStub,
  unicon: { template: "<i />", props: ["name", "height"] },
};

const getWrapper = (
  props: Record<string, unknown> = {},
  provide: Record<string, unknown> = {},
) =>
  mount(EntityElementWrapper, {
    props: {
      label: "Panel",
      entityId: "e1",
      isCollapsed: false,
      ...props,
    },
    slots: {
      content: '<div class="content-slot" />',
    },
    global: { stubs, provide },
  });

describe("EntityElementWrapper inside a preview", () => {
  it("leaves closing the preview to the preview header", () => {
    const wrapper = getWrapper({
      baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
    });
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(false);
  });
});

describe("EntityElementWrapper as a PanelShell (panel-and-block-shells.md)", () => {
  const normal = () => getWrapper({ baseLibraryMode: BaseLibraryModes.NormalBaseLibrary });

  it("is a white card with a 1px panel border, not the gold fill", () => {
    const root = normal().find('[data-cy="entity-element-wrapper"]');
    expect(root.classes()).toEqual(
      expect.arrayContaining(["bg-surface", "border", "border-border-panel", "rounded-card"]),
    );
    expect(root.classes()).not.toContain("bg-accent-normal");
  });

  it("has the accent-light header band", () => {
    expect(normal().find('[data-cy="entity-element-wrapper-header"]').classes()).toEqual(
      expect.arrayContaining(["bg-surface-panel-header", "p-(--panel-header-pad)"]),
    );
  });

  it("titles the panel as an h3 at the panel title size in panel-header ink", () => {
    const title = normal().find('[data-cy="entity-element-wrapper-title"]');
    expect(title.element.tagName).toBe("H3");
    expect(title.classes()).toEqual(
      expect.arrayContaining(["text-(length:--text-panel-title)", "font-black", "text-text-panel-header"]),
    );
  });

  it("pads its content like a panel body", () => {
    expect(normal().find('[data-cy="entity-element-wrapper-content"]').classes()).toContain(
      "p-(--panel-body-pad)",
    );
  });

  it("tightens its body padding when the card itself is narrow", () => {
    const wrapper = normal();
    expect(wrapper.find('[data-cy="entity-element-wrapper"]').classes()).toContain(
      "@container/entity-element",
    );
    expect(wrapper.find('[data-cy="entity-element-wrapper-content"]').classes()).toContain(
      "@max-md/entity-element:p-2",
    );
  });

  it("tells the list inside that it sits in a panel", () => {
    const Probe = {
      inject: { insidePanel: { from: "InsidePanel", default: false } },
      template: '<i data-cy="probe">{{ insidePanel }}</i>',
    };
    const wrapper = mount(EntityElementWrapper, {
      props: { label: "Panel", entityId: "e1", isCollapsed: false },
      slots: { content: Probe },
      global: { stubs },
    });
    expect(wrapper.find('[data-cy="probe"]').text()).toBe("true");
  });
});

describe("EntityElementWrapper in a compact preview (preview-panel.md)", () => {
  const compact = () =>
    getWrapper(
      { label: "panel-labels.changed-mediafiles" },
      { CompactPreview: true },
    );

  it("draws no card of its own inside the preview panel", () => {
    const root = compact().find('[data-cy="entity-element-wrapper"]');
    expect(root.classes()).not.toContain("border");
    expect(root.classes()).not.toContain("rounded-card");
    expect(root.classes()).not.toContain("bg-surface");
  });

  it("shows its label as a block heading instead of the header band", () => {
    const wrapper = compact();
    expect(wrapper.find('[data-cy="entity-element-wrapper-header"]').exists()).toBe(false);
    const heading = wrapper.find('[data-cy="entity-element-wrapper-block-title"]');
    expect(heading.element.tagName).toBe("H4");
    expect(heading.text()).toBe("panel-labels.changed-mediafiles");
    expect(heading.classes()).toEqual(
      expect.arrayContaining(["text-table", "font-bold", "text-text-body"]),
    );
  });

  it("drops the body padding so rows line up with the other compact rows", () => {
    expect(
      compact().find('[data-cy="entity-element-wrapper-content"]').classes(),
    ).not.toContain("p-(--panel-body-pad)");
  });
});
