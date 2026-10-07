import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { reactive } from "vue";

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () =>
    reactive({
      editMode: "edit",
      isEdit: false,
      enableEdit: vi.fn(),
      hideEditButton: vi.fn(),
    }),
}));
vi.mock("@/composables/useRouteHelpers", () => ({
  default: () => ({ isSingle: { value: true } }),
}));
vi.mock("vue-router", () => ({ useRoute: () => ({ params: { id: "entity-1" } }) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

import MetadataEditButton from "@/components/MetadataEditButton.vue";

describe("MetadataEditButton", () => {
  // Per-field editing replaces the page-wide edit mode: every value is edited
  // in place (docs/design-system/patterns/per-field-editing.md).
  it("offers no page-wide edit mode", () => {
    const wrapper = mount(MetadataEditButton, {
      global: { provide: { entityFormData: { id: "entity-1" } } },
    });
    expect(wrapper.find('[data-cy="edit-toggle"]').exists()).toBe(false);
  });
});
