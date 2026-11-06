import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import ListItemEditableValue from "@/components/ListItemEditableValue.vue";
import ListItemInlineField from "@/components/ListItemInlineField.vue";

const mocks = vi.hoisted(() => ({
  loadDocument: vi.fn(),
  query: vi.fn(),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: mocks.loadDocument }),
}));
vi.mock("@/main", () => ({ apolloClient: { query: mocks.query } }));
vi.mock("@/components/ListItemInlineField.vue", () => ({
  default: {
    name: "ListItemInlineField",
    props: {
      metadata: null,
      parentEntityId: null,
      linkedEntityId: null,
      refetchEntities: null,
      ownField: Boolean,
    },
    template: "<div><slot /></div>",
  },
}));

const statusInputField = {
  type: "dropdownSingleselectMetadata",
  options: [{ label: "Open", value: "open" }],
};

const editForm = (formFields: Record<string, unknown>) => ({
  data: { GetDynamicForm: { label: "x", Notification: { formFields } } },
});

const metadata = {
  key: "status",
  label: "metadata.labels.status",
  value: "open",
  editFormQuery: "GetEditNotificationStatusForm",
};

const refetchEntities = vi.fn();
const getWrapper = () =>
  shallowMount(ListItemEditableValue, {
    props: {
      editFormQuery: "GetEditNotificationStatusForm",
      metadata: metadata as any,
      entityId: "notification-1",
      refetchEntities,
    },
    slots: { default: "<span data-cy='read-value'>Open</span>" },
  });

describe("ListItemEditableValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadDocument.mockResolvedValue({ kind: "Document" });
    mocks.query.mockResolvedValue(
      editForm({ status: { inputField: statusInputField } }),
    );
  });

  it("loads the field's edit form", async () => {
    getWrapper();
    await flushPromises();
    expect(mocks.loadDocument).toHaveBeenCalledWith(
      "GetEditNotificationStatusForm",
    );
    expect(mocks.query).toHaveBeenCalledWith({ query: { kind: "Document" } });
  });

  it("edits the value in the row with the form field's input, saved on the row's own entity", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    const inline = wrapper.findComponent(ListItemInlineField);

    expect(inline.exists()).toBe(true);
    expect(inline.props()).toMatchObject({
      metadata: { ...metadata, inputField: statusInputField },
      linkedEntityId: "notification-1",
      ownField: true,
      refetchEntities,
    });
  });

  it("shows the plain value while the form loads", () => {
    const wrapper = getWrapper();
    expect(wrapper.findComponent(ListItemInlineField).exists()).toBe(false);
    expect(wrapper.find("[data-cy='read-value']").exists()).toBe(true);
  });

  it("stays a plain value when the form has no input for this field", async () => {
    mocks.query.mockResolvedValue(editForm({ other: { inputField: {} } }));
    const wrapper = getWrapper();
    await flushPromises();
    expect(wrapper.findComponent(ListItemInlineField).exists()).toBe(false);
    expect(wrapper.find("[data-cy='read-value']").exists()).toBe(true);
  });
});
