import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import EntityElementCoordinateEdit from "../EntityElementCoordinateEdit.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: () => undefined }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false }),
}));
vi.mock("@/composables/useConditionalValidation", () => ({
  useConditionalValidation: () => ({ conditionalFieldIsAvailable: () => true }),
}));
vi.mock("vee-validate", () => ({
  useField: () => ({ errorMessage: { value: "" } }),
}));

const getWrapper = (permitted?: boolean) =>
  shallowMount(EntityElementCoordinateEdit, {
    props: {
      fieldKey: "gps_coordinates",
      label: "metadata.labels.gps-coordinates",
      value: { latitude: "51.05", longitude: "3.72" },
      inputField: { type: "number" } as any,
      entityUuid: "SITE-1",
      ...(permitted === undefined ? {} : { permitted }),
    },
  });

const isRendered = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.find('[data-cy="metadata-wrapper"]').exists();

describe("EntityElementCoordinateEdit", () => {
  it("renders a field the graphql layer marked permitted", () => {
    expect(isRendered(getWrapper(true))).toBe(true);
  });

  it("hides a field the graphql layer marked not permitted", () => {
    expect(isRendered(getWrapper(false))).toBe(false);
  });

  // A client that configures no read gate selects no verdict either, and an
  // unconfigured field was always shown.
  it("renders a field carrying no verdict at all", () => {
    expect(isRendered(getWrapper(undefined))).toBe(true);
  });
});
