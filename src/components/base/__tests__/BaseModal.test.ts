import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import BaseModal from "../BaseModal.vue";
import { type TypeModals, ModalStyle } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import { ref } from "vue";

const createBaseModalMock = (
  overrides: {
    modalInfo?: Partial<{
      open: boolean;
      modalStyle: ModalStyle;
      closeConfirmation: boolean;
    }>;
    [key: string]: any;
  } = {},
) => ({
  getModalInfo: vi.fn(() => ({
    open: true,
    modalStyle: ModalStyle.Center,
    closeConfirmation: false,
    ...overrides.modalInfo,
  })),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  closeAllModals: vi.fn(),
  updateModal: vi.fn(),
  changeCloseConfirmation: vi.fn(),
  modals: {},
  deleteQueryOptions: ref(undefined),
  updateDeleteQueryOptions: vi.fn(),
  modalToCloseAfterConfirm: ref(undefined),
  updateModalToCloseAfterConfirm: vi.fn(),
  someModalIsOpened: ref(false),
  ...overrides,
});

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: vi.fn(() => createBaseModalMock()),
}));

const createModalActionsMock = () => ({
  resetAllProperties: vi.fn(),
  extractActionArguments: vi.fn(),
  initializeGeneralProperties: vi.fn(),
  initializePropertiesForDownload: vi.fn(),
  initializePropertiesForCreateEntity: vi.fn(),
  initializePropertiesForEdit: vi.fn(),
  initializePropertiesForImport: vi.fn(),
  initializePropertiesForDelete: vi.fn(),
  initializePropertiesForBulkOperation: vi.fn(),
  initializePropertiesForSplitScreen: vi.fn(),
  initializePropertiesForContextMenu: vi.fn(),
  initializePropertiesForEntityLink: vi.fn(),
  initializePropertiesForFormTabs: vi.fn(),
  initializePropertiesForEntityRelation: vi.fn(),
  initializePropertiesForCoordinate: vi.fn(),
  initializePropertiesForSavedSearch: vi.fn(),
  initializePropertiesForDeletion: vi.fn(),
  initializePropertiesForBulkDeleteRelations: vi.fn(),
  initializePropertiesForBulkDeleteEntities: vi.fn(),
  initializePropertiesForReorderEntities: vi.fn(),
  initializePropertiesForOpenModal: vi.fn(),
  initializePropertiesForBulkOperationWithValidation: vi.fn(),
  getParentId: vi.fn(),
  getBulkOperationType: vi.fn(),
  getInformationForDelete: vi.fn(),
  getInformationForBulkDeleteEntities: vi.fn(),
  setCallbackFunctions: vi.fn(),
  getRelationType: vi.fn(),
  getCollection: vi.fn(),
  getCallbackFunctions: vi.fn(),
});

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: vi.fn(() => createModalActionsMock()),
}));

describe("BaseModal", () => {
  let wrapper: VueWrapper;
  let baseModalMock: ReturnType<typeof createBaseModalMock>;
  let modalActionsMock: ReturnType<typeof createModalActionsMock>;

  const createWrapper = (props = {}, modalInfoOverrides = {}) => {
    baseModalMock = createBaseModalMock({
      modalInfo: {
        open: true,
        modalStyle: ModalStyle.Center,
        closeConfirmation: false,
        ...modalInfoOverrides,
      },
    });

    modalActionsMock = createModalActionsMock();

    vi.mocked(useBaseModal).mockReturnValue(baseModalMock);
    vi.mocked(useModalActions).mockReturnValue(modalActionsMock);

    return mount(BaseModal, {
      attachTo: document.body,
      props: {
        modalType: "DynamicForm" as TypeModals,
        ...props,
      },
      global: {
        stubs: {
          unicon: {
            template:
              '<div data-testid="unicon" :aria-label="name" :height="height"></div>',
            props: ["height", "name"],
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render dialog element", () => {
      wrapper = createWrapper();
      expect(wrapper.find('[data-testid="modal-dialog"]').exists()).toBe(true);
    });

    it("should render close button when cancelButtonAvailabe is false", () => {
      wrapper = createWrapper({ cancelButtonAvailabe: false });
      expect(wrapper.find('[data-testid="modal-close-button"]').exists()).toBe(
        true,
      );
    });

    it("should not render close button when cancelButtonAvailabe is true", () => {
      wrapper = createWrapper({ cancelButtonAvailabe: true });
      expect(wrapper.find('[data-testid="modal-close-button"]').exists()).toBe(
        false,
      );
    });

    it("should apply correct modal style classes for center style", () => {
      wrapper = createWrapper();
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      expect(dialog.classes()).toContain("m-auto");
      expect(dialog.classes()).toContain("@container/modal");
    });

    it("should apply custom height style", () => {
      const customHeight = "max-h-[90vh] my-[5vh]";
      wrapper = createWrapper({ modalHeightStyle: customHeight });
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      expect(dialog.classes().join(" ")).toContain(customHeight);
    });
  });

  describe("Close Behavior", () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it("should emit hideModal event when close button is clicked", async () => {
      const closeButton = wrapper.find('[data-testid="modal-close-button"]');
      await closeButton.trigger("click");

      expect(wrapper.emitted("update:modalState")).toBeTruthy();
      expect(wrapper.emitted("hideModal")).toBeTruthy();
      expect(wrapper.emitted("update:modalState")?.[0]).toEqual(["hide"]);
      expect(wrapper.emitted("hideModal")?.[0]).toEqual(["hide"]);
    });

    it("should emit hideModal event when dialog close event is triggered", async () => {
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      await dialog.trigger("close");

      expect(wrapper.emitted("update:modalState")).toBeTruthy();
      expect(wrapper.emitted("hideModal")).toBeTruthy();
      expect(wrapper.emitted("update:modalState")?.[0]).toEqual(["hide"]);
      expect(wrapper.emitted("hideModal")?.[0]).toEqual(["hide"]);
    });

    it("should handle ESC key press through cancel event", async () => {
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      const preventDefaultSpy = vi.fn();

      const event = new Event("cancel", { cancelable: true });
      event.preventDefault = preventDefaultSpy;

      dialog.element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(wrapper.emitted("update:modalState")).toBeTruthy();
      expect(wrapper.emitted("hideModal")).toBeTruthy();
      expect(wrapper.emitted("update:modalState")?.[0]).toEqual(["hide"]);
      expect(wrapper.emitted("hideModal")?.[0]).toEqual(["hide"]);
    });

    it("should call resetAllProperties when modal is closed", async () => {
      const modalActionsMock = createModalActionsMock();
      vi.mocked(useModalActions).mockReturnValue(modalActionsMock);

      const closeButton = wrapper.find('[data-testid="modal-close-button"]');
      await closeButton.trigger("click");

      expect(modalActionsMock.resetAllProperties).toHaveBeenCalled();
    });

    it("should handle modal with closeConfirmation", async () => {
      wrapper = createWrapper({}, { closeConfirmation: true });
      const closeButton = wrapper.find('[data-testid="modal-close-button"]');
      await closeButton.trigger("click");

      expect(wrapper.emitted("update:modalState")).toStrictEqual([["hide"]]);
      expect(wrapper.emitted("hideModal")).toStrictEqual([["hide"]]);
    });
  });

  describe("Props and Styling", () => {
    it("should apply icon height correctly", () => {
      const iconHeight = 24;
      wrapper = createWrapper({ iconHeight, cancelButtonAvailabe: false });
      const icon = wrapper.find('[data-testid="modal-close-button"]');
      expect(icon.attributes("height")).toBe(iconHeight.toString());
    });

    it("should use default icon height if not provided", () => {
      wrapper = createWrapper();
      const icon = wrapper.find('[data-testid="modal-close-button"]');
      expect(icon.attributes("height")).toBe("18");
    });

    it("should apply different modal styles based on type", async () => {
      wrapper = createWrapper(
        {},
        {
          modalStyle: ModalStyle.Right,
        },
      );

      await wrapper.vm.$nextTick();
      const dialogRight = wrapper.find('[data-testid="modal-dialog"]');
      const rightClasses = dialogRight.attributes("class");

      expect(rightClasses).toContain("min-w-[40vw]");
      expect(rightClasses).toContain("h-screen");
      expect(rightClasses).toContain("mr-0");
      expect(rightClasses).toContain("my-0");

      wrapper = createWrapper({}, { modalStyle: ModalStyle.RightWide });

      await wrapper.vm.$nextTick();
      const dialogRightWide = wrapper.find('[data-testid="modal-dialog"]');
      const rightWideClasses = dialogRightWide.attributes("class");

      expect(rightWideClasses).toContain("min-w-[80vw]");
      expect(rightWideClasses).toContain("h-screen");
    });

    it("should apply rounded corners for center modals", async () => {
      wrapper = createWrapper({}, { modalStyle: ModalStyle.Center });

      await wrapper.vm.$nextTick();
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      const classes = dialog.attributes("class");
      expect(classes).toContain("rounded-xl");

      wrapper = createWrapper({}, { modalStyle: ModalStyle.CenterWide });

      await wrapper.vm.$nextTick();
      const dialogCenterWide = wrapper.find('[data-testid="modal-dialog"]');
      const centerWideClasses = dialogCenterWide.attributes("class");
      expect(centerWideClasses).toContain("rounded-xl");
    });

    it("should handle custom modal height style", async () => {
      const customHeight = "max-h-[95vh] my-[2.5vh]";
      wrapper = createWrapper({ modalHeightStyle: customHeight });

      await wrapper.vm.$nextTick();
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      const classes = dialog.attributes("class");
      expect(classes).toContain(customHeight);
    });

    it("should use default modal height style if not provided", async () => {
      wrapper = createWrapper();

      await wrapper.vm.$nextTick();
      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      const classes = dialog.attributes("class");
      expect(classes).toContain("max-h-[75vh]");
      expect(classes).toContain("my-[12.5vh]");
    });

    const styleTestCases = [
      {
        style: ModalStyle.Right,
        expectedClasses: ["min-w-[40vw]", "h-screen", "mr-0", "my-0"],
      },
      {
        style: ModalStyle.RightWide,
        expectedClasses: ["min-w-[80vw]", "h-screen"],
      },
      {
        style: ModalStyle.Center,
        expectedClasses: ["rounded-xl", "max-h-[75vh]", "my-[12.5vh]"],
      },
      {
        style: ModalStyle.CenterWide,
        expectedClasses: ["rounded-xl"],
      },
    ];

    styleTestCases.forEach(({ style, expectedClasses }) => {
      it(`should apply correct classes for ${style} style`, async () => {
        wrapper = createWrapper({}, { modalStyle: style });

        await wrapper.vm.$nextTick();
        const dialog = wrapper.find('[data-testid="modal-dialog"]');
        const classes = dialog.classes();

        expectedClasses.forEach((expectedClass) => {
          expect(classes).toContain(expectedClass);
        });
      });
    });
  });

  describe("Snapshot Tests", () => {
    it("matches snapshot for center modal", () => {
      wrapper = createWrapper();
      expect(wrapper.html()).toMatchSnapshot();
    });

    it("matches snapshot for center wide modal", () => {
      wrapper = createWrapper({}, { modalStyle: ModalStyle.CenterWide });
      expect(wrapper.html()).toMatchSnapshot();
    });

    it("matches snapshot for right modal", () => {
      wrapper = createWrapper({}, { modalStyle: ModalStyle.Right });
      expect(wrapper.html()).toMatchSnapshot();
    });

    it("matches snapshot for left modal", () => {
      wrapper = createWrapper({}, { modalStyle: ModalStyle.Left });
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
