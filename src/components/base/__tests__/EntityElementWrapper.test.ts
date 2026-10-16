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
