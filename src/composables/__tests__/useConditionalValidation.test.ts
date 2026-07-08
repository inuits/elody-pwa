import { describe, it, expect } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useForm } from "vee-validate";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import type { VisibleIf } from "@/generated-types/queries";

const FORM_ID = "form-visibility-tests";

const mountWithInitialValues = (
  initialMediafileType: string,
  visibleIf: VisibleIf | null | undefined,
): { visible: boolean } => {
  const result = { visible: false };

  const component = defineComponent({
    setup() {
      const form = useForm({
        initialValues: {
          intialValues: { mediafile_type: initialMediafileType },
        },
      });
      useFormHelper().addForm(FORM_ID, form);

      const { fieldIsVisibleByCondition } = useConditionalValidation();
      result.visible = fieldIsVisibleByCondition(visibleIf, FORM_ID, "");

      return () => h("div");
    },
  });

  mount(component);
  return result;
};

describe("useConditionalValidation — fieldIsVisibleByCondition", () => {
  it("returns true when visibleIf is missing (backward compatible)", () => {
    const { visible } = mountWithInitialValues("trailer", null);
    expect(visible).toBe(true);
  });

  it("returns true when the dependent value is in the allowed values", () => {
    const { visible } = mountWithInitialValues("trailer", {
      dependsOn: "mediafile_type",
      values: ["trailer", "music_fragments", "review"],
    } as VisibleIf);
    expect(visible).toBe(true);
  });

  it("returns false when the dependent value is not in the allowed values", () => {
    const { visible } = mountWithInitialValues("poster", {
      dependsOn: "mediafile_type",
      values: ["trailer", "music_fragments", "review"],
    } as VisibleIf);
    expect(visible).toBe(false);
  });

  it("returns false when the dependent value is empty", () => {
    const { visible } = mountWithInitialValues("", {
      dependsOn: "mediafile_type",
      values: ["trailer"],
    } as VisibleIf);
    expect(visible).toBe(false);
  });

  it("reacts when the dependent value changes at runtime", async () => {
    let visibilityCheck: () => boolean = () => false;

    const component = defineComponent({
      setup() {
        const form = useForm({
          initialValues: {
            intialValues: { mediafile_type: "poster" },
          },
        });
        useFormHelper().addForm(FORM_ID + "-reactive", form);

        const { fieldIsVisibleByCondition } = useConditionalValidation();
        visibilityCheck = () =>
          fieldIsVisibleByCondition(
            {
              dependsOn: "mediafile_type",
              values: ["trailer"],
            } as VisibleIf,
            FORM_ID + "-reactive",
            "",
          );

        return () => h("div", {}, [
          h("input", {
            "data-testid": "type",
            value: form.values.intialValues.mediafile_type,
            onInput: (e: Event) => {
              form.setFieldValue(
                "intialValues.mediafile_type",
                (e.target as HTMLInputElement).value,
              );
            },
          }),
        ]);
      },
    });

    const wrapper = mount(component);
    await nextTick();

    expect(visibilityCheck()).toBe(false);

    await wrapper.get('[data-testid="type"]').setValue("trailer");
    await nextTick();

    expect(visibilityCheck()).toBe(true);
  });
});
