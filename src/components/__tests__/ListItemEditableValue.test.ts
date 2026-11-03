import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ListItemEditableValue from "@/components/ListItemEditableValue.vue";
import {
  ContextMenuFormFlow,
  Entitytyping,
  ModalStyle,
  TypeModals,
} from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({ openModal: vi.fn() }));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: mocks.openModal }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const getDefaultProps = () => ({
  editFormQuery: "GetEditNotificationStatusForm",
  label: "metadata.labels.status",
  entityId: "notification-1",
  entityType: Entitytyping.Notification,
  refetchEntities: vi.fn(),
});
const getWrapper = (props = getDefaultProps()) =>
  shallowMount(ListItemEditableValue, {
    props,
    slots: { default: "<span>Open</span>" },
    global: { stubs: { unicon: true } },
  });

describe("ListItemEditableValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the value as a button", () => {
    const button = getWrapper().find("[data-cy='list-item-editable-value']");
    expect(button.element.tagName).toBe("BUTTON");
    expect(button.text()).toContain("Open");
  });

  it("opens the entity edit modal with the field's form for this row", async () => {
    await getWrapper()
      .find("[data-cy='list-item-editable-value']")
      .trigger("click");
    expect(mocks.openModal).toHaveBeenCalledWith(
      TypeModals.EntityEditModal,
      ModalStyle.CenterWide,
      "GetEditNotificationStatusForm",
      undefined,
      undefined,
      undefined,
      expect.objectContaining({
        entityId: "notification-1",
        entityType: Entitytyping.Notification,
        flow: ContextMenuFormFlow.Update,
      }),
    );
  });

  it("does not let the click reach the row", async () => {
    const rowClick = vi.fn();
    const wrapper = shallowMount(
      {
        components: { ListItemEditableValue },
        props: ["p"],
        template:
          "<div @click='rowClick'><ListItemEditableValue v-bind='p'>x</ListItemEditableValue></div>",
        methods: { rowClick },
      },
      {
        props: { p: getDefaultProps() },
        global: { stubs: { ListItemEditableValue: false, unicon: true } },
      },
    );
    await wrapper.find("[data-cy='list-item-editable-value']").trigger("click");
    expect(rowClick).not.toHaveBeenCalled();
  });

  it("refetches the list after the modal saves", async () => {
    const props = getDefaultProps();
    await getWrapper(props)
      .find("[data-cy='list-item-editable-value']")
      .trigger("click");
    const { callback } = mocks.openModal.mock.calls[0][6];
    callback();
    expect(props.refetchEntities).toHaveBeenCalled();
  });
});
