import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import IiifOperationsModal from "./IiifOperationsModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

// The IIIF operations modal lets the user download a resized/reformatted
// derivative of a mediafile through the IIIF Image API. It reads the file
// name and pixel dimensions from the modal info set at open time.
const meta: Meta<typeof IiifOperationsModal> = {
  title: "Modals/IiifOperationsModal",
  component: IiifOperationsModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof IiifOperationsModal>;

const renderWithFile =
  (fileName: string, originalFilename: string, dimensions: { width: number; height: number }) =>
  () => ({
    components: { IiifOperationsModal },
    setup() {
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() =>
        openModal(
          TypeModals.IiifOperationsModal,
          ModalStyle.Center,
          undefined,
          undefined,
          false,
          undefined,
          { fileName, originalFilename, dimensions },
        ),
      );
    },
    template: "<IiifOperationsModal />",
  });

export const Default: Story = {
  render: renderWithFile(
    "2b1f7c9e-scan-druk-1953.tif",
    "scan_van_druk_1953.tif",
    { width: 4032, height: 3024 },
  ),
};

export const PortraitScan: Story = {
  render: renderWithFile(
    "9d84a2c1-cover-front.jpg",
    "cover_front.jpg",
    { width: 1240, height: 1754 },
  ),
};
