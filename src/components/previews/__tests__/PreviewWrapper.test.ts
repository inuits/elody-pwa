import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PreviewWrapper from "../PreviewWrapper.vue";
import {
  ListItemCoverageTypes,
  PreviewTypes,
} from "@/generated-types/queries";
import { apolloClient, router } from "@/main";

const { mockGoToEntityPage } = vi.hoisted(() => ({
  mockGoToEntityPage: vi.fn(),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn().mockResolvedValue({ data: {} }) },
  router: { push: vi.fn() },
}));

// A PreviewElement shaped so the primaryPreviewElement watcher doesn't throw.
const PRIMARY_PREVIEW_ELEMENT = {
  column: { elements: { entityListElement: { customQueryFilters: "" } } },
};
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: vi.fn().mockResolvedValue({}) }),
}));
vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    addMediafileSelectionStateContext: vi.fn(),
  }),
}));
vi.mock("@/composables/useMaps", () => ({
  useMaps: () => ({ getBasicMapProperties: () => ({ mapType: "osm" }) }),
}));
vi.mock("@/helpers", () => ({
  getTitleOrNameFromEntity: () => "Some title",
  goToEntityPage: (...args: unknown[]) => mockGoToEntityPage(...args),
}));

const CLOSE_SELECTOR = '[data-cy="close-preview-component"]';
const OPEN_DETAIL_SELECTOR = '[data-cy="open-detail-page-button"]';
const LOADING_SELECTOR = '[data-cy="preview-loading"]';

const BaseTooltipStub = {
  template:
    '<div class="base-tooltip-stub"><slot name="activator" :on="{}" /><slot /></div>',
};

const stubs = {
  BaseTooltip: BaseTooltipStub,
  "base-tooltip": BaseTooltipStub,
  EntityColumn: { template: '<div class="entity-column-stub" />' },
  ViewModesMap: { template: '<div class="map-stub" />' },
  MediaViewerPreview: { template: '<div class="media-stub" />' },
  HistoryDiffPreview: { template: '<div class="history-stub" />' },
  unicon: { template: "<i />", props: ["name", "height"] },
  BaseButtonNew: {
    template: '<button class="base-button-new-stub">{{ label }}</button>',
    props: ["label", "buttonSize", "buttonStyle"],
  },
  SpinnerLoader: { template: '<div class="spinner-stub" />' },
};

const getWrapper = (
  previewComponent: Record<string, unknown>,
  extraProps: Record<string, unknown> = {},
) =>
  mount(PreviewWrapper, {
    props: {
      previewComponent: {
        listItemsCoverage: ListItemCoverageTypes.OneListItem,
        ...previewComponent,
      },
      entityType: "asset",
      entities: [{ id: "e1" }],
      entitiesLoading: false,
      configPerViewMode: {},
      entityId: "e1",
      parentIds: [],
      cropMediafileCoordinatesKey: "",
      ...extraProps,
    },
    global: { stubs },
  });

describe("PreviewWrapper close button (header)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does NOT render the header close button for a primary ColumnList preview (it has its own deep close button)", async () => {
    vi.mocked(apolloClient.query).mockResolvedValueOnce({
      data: { PreviewElement: PRIMARY_PREVIEW_ELEMENT },
    });
    const wrapper = getWrapper({
      type: PreviewTypes.ColumnList,
      previewQuery: "GetPreviewInArea",
    });
    await flushPromises();
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(false);
  });

  it("renders the header close button for metadata-only (ColumnList) previews", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.ColumnList,
      metadataPreviewQuery: "GetMetadataPreviewForInscription",
    });
    await flushPromises();
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(true);
  });

  it("renders the header close button for MediaViewer previews", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(true);
  });

  it("renders the header close button for Map previews", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.Map });
    await flushPromises();
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(true);
  });

  it("renders the header close button for History previews", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.History });
    await flushPromises();
    expect(wrapper.find(CLOSE_SELECTOR).exists()).toBe(true);
  });

  it("emits closePreviewComponent when the header close button is clicked", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    await wrapper.find(".base-tooltip-stub").trigger("click");

    expect(wrapper.emitted("closePreviewComponent")).toBeTruthy();
  });
});

describe("PreviewWrapper open detail page button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when previewConfiguration.displayOpenDetailPageButton is true", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.MediaViewer,
      previewConfiguration: { displayOpenDetailPageButton: true },
    });
    await flushPromises();
    expect(wrapper.find(OPEN_DETAIL_SELECTOR).exists()).toBe(true);
  });

  it("does NOT render when displayOpenDetailPageButton is false", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.MediaViewer,
      previewConfiguration: { displayOpenDetailPageButton: false },
    });
    await flushPromises();
    expect(wrapper.find(OPEN_DETAIL_SELECTOR).exists()).toBe(false);
  });

  it("does NOT render when previewConfiguration is absent", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();
    expect(wrapper.find(OPEN_DETAIL_SELECTOR).exists()).toBe(false);
  });

  it("navigates to the entity detail page on click", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.MediaViewer,
      previewConfiguration: { displayOpenDetailPageButton: true },
    });
    await flushPromises();

    await wrapper.find(`${OPEN_DETAIL_SELECTOR} button`).trigger("click");

    expect(mockGoToEntityPage).toHaveBeenCalledWith(
      { id: "e1" },
      "SingleEntity",
      router,
    );
  });
});

describe("PreviewWrapper initial loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loader while the metadata query is in flight", async () => {
    vi.mocked(apolloClient.query).mockReturnValueOnce(
      new Promise(() => {}), // never resolves → stays loading
    );
    const wrapper = getWrapper({
      type: PreviewTypes.ColumnList,
      metadataPreviewQuery: "GetMetadataPreviewForInscription",
    });
    await flushPromises();
    expect(wrapper.find(LOADING_SELECTOR).exists()).toBe(true);
  });

  it("hides the loader once the query resolves", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.ColumnList,
      metadataPreviewQuery: "GetMetadataPreviewForInscription",
    });
    await flushPromises();
    expect(wrapper.find(LOADING_SELECTOR).exists()).toBe(false);
  });

  it("does not show a loader when the preview has no query (e.g. MediaViewer)", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();
    expect(wrapper.find(LOADING_SELECTOR).exists()).toBe(false);
  });
});
