import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ReadOnlyMetadataWrapper from "@/components/metadata/ReadOnlyMetadataWrapper.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

// tooltip.md: light text on the inverted surface. The value component sets its
// own secondary ink, which was dark on dark (list rows, e.g. aicap "Reading").
describe("ReadOnlyMetadataWrapper full-value tooltip", () => {
  it("shows the value in the tooltip's own light ink", () => {
    const wrapper = shallowMount(ReadOnlyMetadataWrapper, {
      props: {
        isEdit: false,
        formId: "f",
        metadata: { key: "reading", label: "Reading", value: "long" } as any,
      },
      global: {
        stubs: {
          BaseTooltip: {
            template: `<div><slot name="activator" :on="{}" /><slot /></div>`,
          },
        },
      },
    });
    const tooltipValue = wrapper.find('[data-cy="field-value-tooltip"]');

    expect(tooltipValue.classes()).toContain("!text-inherit");
    expect(tooltipValue.classes()).not.toContain("text-text-placeholder");
  });
});
