import { shallowMount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import QueryAction from "../QueryAction.vue";

const mockQuery = vi.fn().mockResolvedValue({ data: {} });
const mockMutate = vi.fn().mockResolvedValue({ data: {} });
const mockRefetchParentEntity = vi.fn().mockResolvedValue(undefined);
const mockDisplaySuccessNotification = vi.fn();
const mockDisplayErrorNotification = vi.fn();
const mockDocument = { definitions: [{ kind: "OperationDefinition", operation: "query" }] };
const mockMutationDocument = { definitions: [{ kind: "OperationDefinition", operation: "mutation" }] };
const mockLoadDocument = vi.fn().mockResolvedValue(mockDocument);
const mockRouterPush = vi.fn();

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: mockLoadDocument,
  }),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mockDisplaySuccessNotification,
    displayErrorNotification: mockDisplayErrorNotification,
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    Label: { name: "Label" },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const flush = async () => {
  await flushPromises();
  await flushPromises();
};

const mountComponent = (props = {}) => {
  return shallowMount(QueryAction, {
    props: {
      label: "test-label",
      icon: "Label",
      query: "GetCreateLabelForManifestation",
      refreshAfterAction: true,
      entityId: "M-12345",
      ...props,
    },
    global: {
      provide: {
        [DefaultApolloClient as symbol]: { query: mockQuery, mutate: mockMutate },
        RefetchParentEntity: mockRefetchParentEntity,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
};

describe("QueryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ data: {} });
    mockMutate.mockResolvedValue({ data: {} });
    mockLoadDocument.mockResolvedValue(mockDocument);
    mockRefetchParentEntity.mockResolvedValue(undefined);
  });

  it("executes query with entity id", async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockLoadDocument).toHaveBeenCalledWith("GetCreateLabelForManifestation");
    expect(mockQuery).toHaveBeenCalledWith({
      query: mockDocument,
      variables: { id: "M-12345" },
      fetchPolicy: "no-cache",
    });
  });

  it("refetches when refreshAfterAction is true", async () => {
    const wrapper = mountComponent({ refreshAfterAction: true });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockRefetchParentEntity).toHaveBeenCalled();
  });

  it("does not refetch when refreshAfterAction is false", async () => {
    const wrapper = mountComponent({ refreshAfterAction: false });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockRefetchParentEntity).not.toHaveBeenCalled();
  });

  it("shows success notification after execution", async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockDisplaySuccessNotification).toHaveBeenCalledWith(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
  });

  it("shows error notification on failure", async () => {
    mockQuery.mockRejectedValue(new Error("query failed"));

    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockDisplayErrorNotification).toHaveBeenCalledWith(
      "notifications.errors.validation-error.title",
      "",
    );
  });
});

describe("QueryAction - mutation flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockResolvedValue({ data: {} });
    mockLoadDocument.mockResolvedValue(mockMutationDocument);
    mockRefetchParentEntity.mockResolvedValue(undefined);
  });

  it("executes mutate with entity id for mutation documents", async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: mockMutationDocument,
      variables: { id: "M-12345" },
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("shows success notification after mutation", async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockDisplaySuccessNotification).toHaveBeenCalledWith(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
  });

  it("shows error notification when mutation fails", async () => {
    mockMutate.mockRejectedValue(new Error("mutation failed"));

    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockDisplayErrorNotification).toHaveBeenCalledWith(
      "notifications.errors.validation-error.title",
      "",
    );
  });

  it("navigates to created entity when navigateToCreatedEntity is true", async () => {
    mockMutate.mockResolvedValue({
      data: { CreateEntity: { uuid: "DL-abc123", type: "download" } },
    });

    const wrapper = mountComponent({ navigateToCreatedEntity: true });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "DL-abc123", type: "download" },
    });
    expect(mockDisplaySuccessNotification).not.toHaveBeenCalled();
  });

  it("shows success notification when navigateToCreatedEntity is false", async () => {
    const wrapper = mountComponent({ navigateToCreatedEntity: false });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");
    await flush();

    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockDisplaySuccessNotification).toHaveBeenCalled();
  });
});
