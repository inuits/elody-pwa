import { describe, it, expect, vi, beforeEach } from "vitest";
import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import MultiEntityColumn from "../MultiEntityColumn.vue";

const mocks = vi.hoisted(() => ({
  editHelper: {} as any,
  getEditableMetadataKeys: vi.fn(),
  discardEditForForm: vi.fn(),
  fetchUpdateAndDeletePermission: vi.fn(),
  setEntityUuid: vi.fn(),
  setEntityType: vi.fn(),
  isAuthenticated: { value: true },
}));

vi.mock("@/components/EntityColumn.vue", () => ({
  default: { name: "EntityColumn", template: "<div />" },
}));

vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: {
    name: "BaseButtonNew",
    props: ["label"],
    emits: ["click"],
    template: `<button @click="$emit('click')">{{ label }}</button>`,
  },
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => mocks.editHelper,
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getEditableMetadataKeys: mocks.getEditableMetadataKeys,
    discardEditForForm: mocks.discardEditForForm,
  }),
}));

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    fetchUpdateAndDeletePermission: mocks.fetchUpdateAndDeletePermission,
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    setEntityUuid: mocks.setEntityUuid,
    setEntityType: mocks.setEntityType,
  }),
}));

vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: vi.fn().mockResolvedValue("cancel") }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ closeModal: vi.fn() }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/main", () => ({
  auth: { isAuthenticated: mocks.isAuthenticated },
}));

const entity = {
  id: "W-1",
  uuid: "W-1",
  type: "work_word",
  intialValues: { identifiers: ["W-1"] },
  entityView: { column: {} },
  relationValues: {},
} as any;

const getWrapper = () =>
  mount(MultiEntityColumn, {
    props: { entity, refetch: vi.fn() },
    global: { mocks: { $t: (key: string) => key } },
  });

describe("MultiEntityColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editHelper = reactive({
      isEdit: false,
      editMode: "edit",
      showErrors: false,
      enableEdit: vi.fn(function (this: any) {
        this.isEdit = true;
      }),
      save: vi.fn(),
      discard: vi.fn(),
      clickButton: vi.fn(),
      setEditMode: vi.fn(),
      hideEditButton: vi.fn(),
    });
    mocks.fetchUpdateAndDeletePermission.mockReturnValue(
      Promise.resolve(
        new Map([
          ["canupdate", true],
          ["candelete", true],
        ]),
      ),
    );
  });

  it("registers editable metadata keys under the entity id (so saved metadata is not dropped)", async () => {
    getWrapper();
    await flushPromises();
    expect(mocks.getEditableMetadataKeys).toHaveBeenCalledWith(
      entity.entityView,
      "W-1",
    );
  });

  it("fetches and applies edit permissions for its own entity", async () => {
    getWrapper();
    await flushPromises();
    expect(mocks.fetchUpdateAndDeletePermission).toHaveBeenCalledWith(
      "W-1",
      "work_word",
    );
    expect(mocks.editHelper.setEditMode).toHaveBeenCalledWith("edit-delete");
  });

  it("enters edit mode and focuses the entity-single singleton on its own entity", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    await wrapper.find("button").trigger("click");
    expect(mocks.setEntityUuid).toHaveBeenCalledWith("W-1");
    expect(mocks.setEntityType).toHaveBeenCalledWith("work_word");
    expect(mocks.editHelper.enableEdit).toHaveBeenCalled();
  });

  it("saves through its own edit state", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    // enter edit mode -> Save/Cancel buttons appear
    await wrapper.find("button").trigger("click");
    const saveButton = wrapper
      .findAll("button")
      .find((b) => b.text() === "bulk-operations.save");
    expect(saveButton).toBeTruthy();
    await saveButton!.trigger("click");
    expect(mocks.editHelper.clickButton).toHaveBeenCalled();
    expect(mocks.editHelper.save).toHaveBeenCalled();
  });
});
