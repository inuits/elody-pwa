import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import EntityButtons from "@/components/EntityButtons.vue";
import {
  ActionButtonResult,
  type Buttons,
  type Entitytyping,
} from "@/generated-types/queries";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

vi.mock("@/types", () => ({
  Unicons: { DownloadAlt: { name: "download-alt" } },
}));

const runActionButton = vi.fn();
vi.mock("@/composables/useActionButton", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useActionButton")>()),
  useActionButton: () => ({ runActionButton }),
}));

vi.mock("@/main", () => ({ apolloClient: {} }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const downloadButton = {
  __typename: "ActionButton",
  label: "actions.labels.download",
  icon: "DownloadAlt",
  onResult: ActionButtonResult.DownloadFile,
  variables: { mediafileId: "intialValues.id" },
};

const contextMenu = {
  __typename: "ContextMenuActions",
  doLinkAction: { label: "follow", icon: "AngleRight" },
};

const getWrapper = (buttons: unknown) =>
  mount(EntityButtons, {
    props: {
      buttons: buttons as Buttons,
      entityId: "MF-1",
      entityType: "mediafile" as Entitytyping,
      bulkOperationsContext: BulkOperationsContextEnum.Home,
      intialValues: { id: "MF-1" },
      relationValues: {},
    },
    global: {
      provide: { RefetchParentEntity: vi.fn() },
      stubs: {
        BaseContextMenuActions: {
          name: "BaseContextMenuActions",
          props: ["contextMenuActions"],
          template: '<div data-test="context-menu" />',
        },
        BaseTooltip: {
          template: '<div><slot name="activator" :on="{}" /></div>',
        },
        unicon: true,
      },
    },
  });

describe("EntityButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders buttons and the context menu in configured order", () => {
    const wrapper = getWrapper({
      __typename: "Buttons",
      download: downloadButton,
      contextMenu,
    });

    const rendered = wrapper
      .findAll('[data-test="context-menu"], button')
      .map((element) => element.element.tagName);
    expect(rendered).toEqual(["BUTTON", "DIV"]);
    expect(
      wrapper.findComponent({ name: "BaseContextMenuActions" }).props(
        "contextMenuActions",
      ),
    ).toEqual(contextMenu);
  });

  it("treats the contextMenu key as the context menu without a typename", () => {
    const { __typename, ...untypedContextMenu } = contextMenu;
    const wrapper = getWrapper({ contextMenu: untypedContextMenu });

    expect(wrapper.findAll("button")).toHaveLength(0);
    expect(wrapper.find('[data-test="context-menu"]').exists()).toBe(true);
  });

  it("leaves out a button whose hide condition holds for the row", () => {
    const wrapper = getWrapper({
      download: { ...downloadButton, hideIf: ["!intialValues.filename"] },
    });

    expect(wrapper.findAll("button")).toHaveLength(0);
  });

  it("skips a button the graphql layer left out", () => {
    const wrapper = getWrapper({ download: null, contextMenu });

    expect(wrapper.findAll("button")).toHaveLength(0);
    expect(wrapper.find('[data-test="context-menu"]').exists()).toBe(true);
  });

  it("runs the button with the row values and keeps the click from the row", async () => {
    const rowClick = vi.fn();
    const wrapper = getWrapper({ download: downloadButton });
    const parent = document.createElement("div");
    parent.addEventListener("click", rowClick);
    parent.appendChild(wrapper.element);

    await wrapper.find("button").trigger("click");

    expect(runActionButton).toHaveBeenCalledWith(
      downloadButton,
      "MF-1",
      { intialValues: { id: "MF-1" }, relationValues: {} },
      expect.any(Function),
    );
    expect(rowClick).not.toHaveBeenCalled();
  });
});
