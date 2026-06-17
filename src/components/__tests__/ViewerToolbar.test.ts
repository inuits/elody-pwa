import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ViewerToolbar from "@/components/ViewerToolbar.vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  isSelectable: vi.fn(() => false),
  downloadMediafile: vi.fn(),
  downloadLoading: { value: false },
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: mocks.openModal }),
}));

vi.mock("@/composables/useMediafileCrop", () => ({
  useMediafileCrop: () => ({ isSelectable: mocks.isSelectable }),
}));

vi.mock("@/composables/useMediafileDownload", () => ({
  useMediafileDownload: () => ({
    downloadMediafile: mocks.downloadMediafile,
    downloadLoading: mocks.downloadLoading,
  }),
}));

vi.mock("@/types", () => ({
  Unicons: new Proxy({}, { get: (_t, name) => ({ name: String(name) }) }),
}));

const getDefaultProps = () => ({
  originalFilename: "original-test.jpg",
  mediafileId: "mediafile-1",
  imageFilename: "display-test.jpg",
  dimensions: { width: 1200, height: 800 },
  enableSelection: false,
});

const getWrapper = (props = getDefaultProps()) =>
  mount(ViewerToolbar, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BaseTooltip: {
          template: '<div><slot name="activator" :on="{}" /></div>',
        },
        SpinnerLoader: { template: "<div />" },
        unicon: { template: "<span />", props: ["name", "height"] },
      },
    },
  });

describe("ViewerToolbar - open IIIF operations modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the global IIIF operations modal and passes the viewer's data through the store", async () => {
    const wrapper = getWrapper();

    await wrapper
      .find('[data-testid="open-iiif-operations-modal"]')
      .trigger("click");

    expect(mocks.openModal).toHaveBeenCalledTimes(1);
    const call = mocks.openModal.mock.calls[0];
    expect(call[0]).toBe(TypeModals.IiifOperationsModal);
    expect(call[1]).toBe(ModalStyle.Center);
    // the viewer-specific data must be carried in the modal-type-specific info
    const modalTypeSpecificInfo = call[call.length - 1];
    expect(modalTypeSpecificInfo).toMatchObject({
      fileName: "display-test.jpg",
      originalFilename: "original-test.jpg",
      dimensions: { width: 1200, height: 800 },
    });
  });
});
