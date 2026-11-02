import { describe, it, expect, vi } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

const confirm = vi.fn().mockResolvedValue("cancel");

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, args?: unknown) => (Array.isArray(args) ? `${key}:${JSON.stringify(args)}` : key),
    te: (key: string) => key === "entity-translations.manifestation_music",
  }),
}));
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { type: "manifestation_music", id: "m1" }, meta: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/main", () => ({ apolloClient: {} }));
vi.mock("@/helpers", () => ({
  getTitleOrNameFromEntity: () => "manifest1",
  mapUrlToEntityType: (slug: string) => slug,
}));
vi.mock("@/composables/useEdit", () => ({ useEditMode: () => ({ editMode: "edit-delete" }) }));
vi.mock("@/composables/usePageInfo", () => ({
  usePageInfo: () => ({ pageInfo: ref({}), previousPageInfo: ref({}), cleanupPreviousPageInfoById: vi.fn() }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ closeModal: vi.fn(), openModal: vi.fn(), deleteQueryOptions: ref(undefined) }),
}));
vi.mock("@/composables/useBulkOperations", () => ({ useBulkOperations: () => ({ dequeueItemForBulkProcessing: vi.fn() }) }));
vi.mock("@/composables/useTenant", () => ({ default: () => ({ getTenants: vi.fn() }) }));
vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => ({ initializeGeneralProperties: vi.fn(), initializePropertiesForDeletion: vi.fn() }),
}));
vi.mock("@/composables/useConfirmModal", () => ({ useConfirmModal: () => ({ confirm }) }));
vi.mock("@/composables/useDeleteEntities", () => ({ useDeleteEntities: () => ({ deleteEntities: vi.fn() }) }));
vi.mock("@/composables/useFormHelper", () => ({ useFormHelper: () => ({ getForm: () => ({ values: { uuid: "m1" } }) }) }));
vi.mock("@/composables/useBaseNotification", () => ({ useBaseNotification: () => ({ displaySuccessNotification: vi.fn() }) }));
vi.mock("@/composables/useEntitySingle", () => ({ default: () => ({ getEntityUuid: () => "m1" }) }));
vi.mock("@/composables/useBreadcrumbs", () => ({ useBreadcrumbs: () => ({ previousRoute: ref({}) }) }));
vi.mock("@/composables/useAsyncAction", () => ({ useAsyncAction: () => ({ isBusy: ref(false), run: vi.fn() }) }));

import DeleteButton from "@/components/DeleteButton.vue";

// modal.md: "Delete permanently?"; the body names the record and its type in
// words, never the internal type key
describe("DeleteButton confirm", () => {
  it("names the record and its translated type, not the raw type key", async () => {
    const wrapper = shallowMount(DeleteButton, {
      global: { provide: { config: {}, entityFormData: { id: "m1" } } },
    });
    await wrapper.findComponent({ name: "BaseButtonNew" }).vm.$emit("click");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith({
      title: "confirm.delete-entity.title",
      message: `confirm.delete-entity.message-named:${JSON.stringify(["'manifest1' (entity-translations.manifestation_music)"])}`,
      confirmLabel: "confirm.delete-entity.confirm",
      cancelLabel: "confirm.delete-entity.cancel",
    });
  });
});
