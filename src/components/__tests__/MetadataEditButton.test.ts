import { beforeEach, describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { reactive, ref } from "vue";

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
const pageConfig = vi.hoisted(() => ({
  hasEditMetadataButton: undefined as boolean | undefined,
}));
vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({
    hasEditMetadataButton: ref(pageConfig.hasEditMetadataButton),
  }),
}));
vi.mock("vue-router", () => ({ useRoute: () => ({ params: { id: "entity-1" } }) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

import MetadataEditButton from "@/components/MetadataEditButton.vue";

const mountButton = () =>
  mount(MetadataEditButton, {
    global: {
      provide: { entityFormData: { id: "entity-1" } },
      stubs: { BaseButtonNew: true, "base-button-new": true },
    },
  });

describe("MetadataEditButton", () => {
  beforeEach(() => {
    pageConfig.hasEditMetadataButton = undefined;
  });

  // Fields are edited in place; the page-wide edit mode is opt-in per entity
  // type (docs/design-system/patterns/per-field-editing.md).
  it("offers no page-wide edit mode by default", () => {
    expect(mountButton().find('[data-cy="edit-toggle"]').exists()).toBe(false);
  });

  it("offers it for an entity type whose page config turns it on", () => {
    pageConfig.hasEditMetadataButton = true;
    expect(mountButton().find('[data-cy="edit-toggle"]').exists()).toBe(true);
  });

  it("keeps it off for an entity type whose page config turns it off", () => {
    pageConfig.hasEditMetadataButton = false;
    expect(mountButton().find('[data-cy="edit-toggle"]').exists()).toBe(false);
  });
});
