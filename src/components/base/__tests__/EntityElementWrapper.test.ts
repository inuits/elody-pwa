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

describe("EntityElementWrapper close button (deep, per panel)", () => {
  it("renders the close button when baseLibraryMode is PreviewBaseLibrary", () => {
    const wrapper = getWrapper({
      baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
    });
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(true);
  });

  it("does NOT render the close button when baseLibraryMode is NormalBaseLibrary", () => {
    const wrapper = getWrapper({
      baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    });
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(false);
  });

  it("does NOT render the close button (nor the header) when headerStyle is 'none'", () => {
    const wrapper = getWrapper({
      baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
      headerStyle: "none",
    });
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(false);
  });

  it("emits closePreviewComponent when the close button is clicked", async () => {
    const wrapper = getWrapper({
      baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
    });

    await wrapper.find(".base-tooltip-stub").trigger("click");

    expect(wrapper.emitted("closePreviewComponent")).toBeTruthy();
  });
});
