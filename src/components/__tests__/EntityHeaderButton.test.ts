import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import EntityHeaderButton from "@/components/EntityHeaderButton.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { flushPromises } from "@vue/test-utils";

const mockMutate = vi.fn();
const mockLoadDocument = vi.fn().mockResolvedValue({ kind: "Document" });
const mockDisplaySuccess = vi.fn();
const mockDisplayError = vi.fn();
const mockRefetchEntity = vi.fn();

const mockRoute = ref({
  params: { id: "entity-123" } as Record<string, unknown>,
});

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

let mockGetRefetch: () => (() => void) | undefined = () => undefined;
vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getRefetch: () => mockGetRefetch(),
  }),
}));


const mockApolloClient = { mutate: mockMutate };

const mountComponent = (refetch?: () => void) => {
  mockGetRefetch = () => refetch;
  return shallowMount(EntityHeaderButton, {
    props: { label: "header.archive", mutation: "ArchiveProduction" },
    global: {
      provide: {
        [DefaultApolloClient as symbol]: mockApolloClient,
      },
      stubs: {
        BaseButtonNew: {
          emits: ["click"],
          template: "<button @click=\"$emit('click')\"></button>",
        },
      },
    },
  });
};

describe("EntityHeaderButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.value = { params: { id: "entity-123" } };
    mockMutate.mockResolvedValue({});
  });

  it("calls mutation with current entity id on click", async () => {
    const wrapper = mountComponent();
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockLoadDocument).toHaveBeenCalledWith("ArchiveProduction");
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: { kind: "Document" },
      variables: { id: "entity-123" },
    });
  });

  it("calls refetchEntity after successful mutation", async () => {
    const wrapper = mountComponent(mockRefetchEntity);
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockRefetchEntity).toHaveBeenCalledOnce();
  });

  it("shows success notification after mutation", async () => {
    const wrapper = mountComponent();
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockDisplaySuccess).toHaveBeenCalledOnce();
    expect(mockDisplayError).not.toHaveBeenCalled();
  });

  it("does not call refetchEntity on mutation failure", async () => {
    mockMutate.mockRejectedValue(new Error("network error"));
    const wrapper = mountComponent(mockRefetchEntity);
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockRefetchEntity).not.toHaveBeenCalled();
  });

  it("shows error notification on mutation failure", async () => {
    mockMutate.mockRejectedValue(new Error("network error"));
    const wrapper = mountComponent();
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockDisplayError).toHaveBeenCalledOnce();
    expect(mockDisplaySuccess).not.toHaveBeenCalled();
  });

  it("works without refetchEntity provided", async () => {
    const wrapper = mountComponent(undefined);
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockDisplaySuccess).toHaveBeenCalledOnce();
  });
});
