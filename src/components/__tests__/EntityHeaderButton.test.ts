import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import EntityHeaderButton from "@/components/EntityHeaderButton.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { flushPromises } from "@vue/test-utils";
import { isToggleButton } from "@/types/contextMenuRouteConfig";
import type { ToggleEntityButtonConfig } from "@/types/contextMenuRouteConfig";
import * as EditComposable from "@/composables/useEdit";

const mockMutate = vi.fn();
const mockLoadDocument = vi.fn().mockResolvedValue({ kind: "Document" });
const mockDisplaySuccess = vi.fn();
const mockDisplayError = vi.fn();
const mockRefetchEntity = vi.fn();

const mockRoute = ref({
  params: { id: "entity-123" } as Record<string, unknown>,
});

let mockFormValues: Record<string, unknown> = {};

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute.value,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: mockLoadDocument }),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mockDisplaySuccess,
    displayErrorNotification: mockDisplayError,
  }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getFormByRouteId: () => ({ form: { values: mockFormValues } }),
  }),
}));

let mockGetRefetch: () => (() => void) | undefined = () => undefined;
vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getRefetch: () => mockGetRefetch(),
    getEntityUuid: () => mockRoute.value.params.id,
  }),
}));

const mockApolloClient = { mutate: mockMutate };

const plainConfig = { label: "header.archive", mutation: "ArchiveProduction" };

const toggleConfig: ToggleEntityButtonConfig = {
  toggle: true,
  metadataKey: "intialValues.enabled",
  whenTrue: { label: "header.disable-user", mutation: "DisableUser" },
  whenFalse: { label: "header.enable-user", mutation: "EnableUser" },
};

const mountButton = (
  config: typeof plainConfig | ToggleEntityButtonConfig,
  refetch?: () => void,
) => {
  mockGetRefetch = () => refetch;
  return shallowMount(EntityHeaderButton, {
    props: { config },
    global: {
      provide: { [DefaultApolloClient as symbol]: mockApolloClient },
      stubs: {
        BaseButtonNew: {
          props: ["label", "loading"],
          emits: ["click"],
          template: "<button @click=\"$emit('click')\">{{ label }}</button>",
        },
      },
    },
  });
};

describe("EntityHeaderButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(EditComposable, "useEditMode").mockReturnValue({
      editMode: "edit-delete",
    });

    mockRoute.value = { params: { id: "entity-123" } };
    mockMutate.mockResolvedValue({});
    mockFormValues = {};
  });

  describe("with plain config", () => {
    it("calls mutation with current entity id on click", async () => {
      const wrapper = mountButton(plainConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockLoadDocument).toHaveBeenCalledWith("ArchiveProduction");
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: { kind: "Document" },
        variables: { id: "entity-123" },
      });
    });

    it("calls refetchEntity after successful mutation", async () => {
      const wrapper = mountButton(plainConfig, mockRefetchEntity);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockRefetchEntity).toHaveBeenCalledOnce();
    });

    it("shows success notification after mutation", async () => {
      const wrapper = mountButton(plainConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockDisplaySuccess).toHaveBeenCalledOnce();
      expect(mockDisplayError).not.toHaveBeenCalled();
    });

    it("does not call refetchEntity on mutation failure", async () => {
      mockMutate.mockRejectedValue(new Error("network error"));
      const wrapper = mountButton(plainConfig, mockRefetchEntity);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockRefetchEntity).not.toHaveBeenCalled();
    });

    it("shows error notification on mutation failure", async () => {
      mockMutate.mockRejectedValue(new Error("network error"));
      const wrapper = mountButton(plainConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockDisplayError).toHaveBeenCalledOnce();
      expect(mockDisplaySuccess).not.toHaveBeenCalled();
    });
  });

  describe("isToggleButton", () => {
    it("returns true for toggle config", () => {
      expect(isToggleButton(toggleConfig)).toBe(true);
    });

    it("returns false for plain config", () => {
      expect(isToggleButton(plainConfig as any)).toBe(false);
    });

    it("returns false for config without toggle property", () => {
      expect(isToggleButton({ label: "x", mutation: "Y" } as any)).toBe(false);
    });
  });

  describe("with toggle config", () => {
    it("fires whenTrue mutation when metadata value is truthy", async () => {
      mockFormValues = { intialValues: { enabled: true } };
      const wrapper = mountButton(toggleConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockLoadDocument).toHaveBeenCalledWith("DisableUser");
    });

    it("fires whenFalse mutation when metadata value is falsy", async () => {
      mockFormValues = { intialValues: { enabled: false } };
      const wrapper = mountButton(toggleConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockLoadDocument).toHaveBeenCalledWith("EnableUser");
    });

    it("fires whenFalse mutation when metadata key is absent from form", async () => {
      mockFormValues = { intialValues: {} };
      const wrapper = mountButton(toggleConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockLoadDocument).toHaveBeenCalledWith("EnableUser");
    });

    it("fires whenFalse mutation when form has no values", async () => {
      mockFormValues = {};
      const wrapper = mountButton(toggleConfig);
      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(mockLoadDocument).toHaveBeenCalledWith("EnableUser");
    });

    it("shows whenTrue label when metadata value is truthy", () => {
      mockFormValues = { intialValues: { enabled: true } };
      const wrapper = mountButton(toggleConfig);

      expect(wrapper.find("button").text()).toBe("header.disable-user");
    });

    it("shows whenFalse label when metadata value is falsy", () => {
      mockFormValues = { intialValues: { enabled: false } };
      const wrapper = mountButton(toggleConfig);

      expect(wrapper.find("button").text()).toBe("header.enable-user");
    });
  });
});
