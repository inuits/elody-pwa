import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import BulkOperationsExportCsv from "./BulkOperationsExportCsv.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  Entitytyping,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";

// CSV-export panel (normally hosted inside BulkOperationsModal): selected
// items on the left, exportable field checkboxes on the right. The field
// list comes from a GetBulkOperationCsvExportKeys query — empty with the
// Storybook Apollo client — so the right column shows its empty state while
// the enqueued fixture items render on the left.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
  bulkSelectAllSizeLimit: 500,
};

const context = BulkOperationsContextEnum.EntityElementMedia;

const enqueuedMediafiles = [
  {
    id: "mediafile-1",
    type: Entitytyping.Mediafile,
    teaserMetadata: [
      { key: "filename", label: "Filename", value: "scan_druk_1953.tif" },
    ],
  },
  {
    id: "mediafile-2",
    type: Entitytyping.Mediafile,
    teaserMetadata: [
      { key: "filename", label: "Filename", value: "cover_front.jpg" },
    ],
  },
] as any[];

const meta: Meta<typeof BulkOperationsExportCsv> = {
  title: "BulkOperations/BulkOperationsExportCsv",
  component: BulkOperationsExportCsv,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof BulkOperationsExportCsv>;

export const Default: Story = {
  render: () => ({
    components: { BulkOperationsExportCsv },
    setup() {
      provide("config", storyConfig);
      const { dequeueAllItemsForBulkProcessing, enqueueItemForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(context);
      enqueuedMediafiles.forEach((item) =>
        enqueueItemForBulkProcessing(context, item),
      );
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() =>
        openModal(
          TypeModals.BulkOperations,
          ModalStyle.CenterWide,
          undefined,
          undefined,
          false,
          context,
        ),
      );
    },
    template:
      '<div class="h-[600px] bg-background-light"><BulkOperationsExportCsv /></div>',
  }),
};
