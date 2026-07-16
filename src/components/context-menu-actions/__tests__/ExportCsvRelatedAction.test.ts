import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExportCsvRelatedAction from "../ExportCsvRelatedAction.vue";

const mockOpenModal = vi.fn();
const mockInitializeGeneralProperties = vi.fn();

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: mockOpenModal,
  }),
}));

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => ({
    initializeGeneralProperties: mockInitializeGeneralProperties,
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    FileExport: { name: "FileExport" },
  },
}));

vi.mock("@/queryLoader", () => ({
  BulkOperationTypes: { ExportCsv: "ExportCsv" },
  ModalStyle: { CenterWide: "CenterWide" },
  TypeModals: { BulkOperations: "BulkOperations" },
}));

const mountComponent = (props = {}) =>
  shallowMount(ExportCsvRelatedAction, {
    props: {
      label: "contextMenu.exportCsvAllAssets",
      icon: "FileExport",
      entityId: "set-123",
      entityType: "asset",
      parentRelation: "hasAsset",
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe("ExportCsvRelatedAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls initializeGeneralProperties then openModal on click", async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");

    expect(mockInitializeGeneralProperties).toHaveBeenCalledWith(
      "set-123",
      "hasAsset",
      undefined,
      [],
      "ExportCsv",
    );
    expect(mockOpenModal).toHaveBeenCalledWith(
      "BulkOperations",
      "CenterWide",
      undefined,
      undefined,
      false,
      undefined,
      { relatedExportEntityType: "asset" },
    );
  });

  it("passes entityType from props into relatedExportEntityType", async () => {
    const wrapper = mountComponent({ entityType: "mediafile" });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");

    expect(mockOpenModal).toHaveBeenCalledWith(
      "BulkOperations",
      "CenterWide",
      undefined,
      undefined,
      false,
      undefined,
      { relatedExportEntityType: "mediafile" },
    );
  });

  it("passes parentRelation from props to initializeGeneralProperties", async () => {
    const wrapper = mountComponent({ parentRelation: "hasMediafile", entityId: "prod-456" });
    await wrapper.findComponent({ name: "BaseContextMenuItem" }).vm.$emit("clicked");

    expect(mockInitializeGeneralProperties).toHaveBeenCalledWith(
      "prod-456",
      "hasMediafile",
      undefined,
      [],
      "ExportCsv",
    );
  });
});
