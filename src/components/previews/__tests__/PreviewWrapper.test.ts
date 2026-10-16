import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PreviewWrapper from "../PreviewWrapper.vue";
import { ListItemCoverageTypes, PreviewTypes } from "@/generated-types/queries";
import { apolloClient, router } from "@/main";

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
}));

const CLOSE_SELECTOR = '[data-cy="close-preview-component"]';
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
    template:
      '<button class="base-button-new-stub" :aria-label="ariaLabel">{{ label }}</button>',
    props: ["label", "buttonSize", "buttonStyle", "ariaLabel"],
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

const mountAttached = (previewComponent: Record<string, unknown>) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  return mount(PreviewWrapper, {
    attachTo: host,
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
    },
    global: { stubs },
  });
};

describe("PreviewWrapper panel shell header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is a complementary region named by the entity title", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();
    const region = wrapper.find('[role="complementary"]');
    const title = wrapper.find(`#${region.attributes("aria-labelledby")}`);

    expect(title.text()).toBe("Some title");
  });

  it("uses the configured title over the entity title", async () => {
    const wrapper = getWrapper({
      type: PreviewTypes.Map,
      title: "preview.map-title",
    });
    await flushPromises();

    expect(wrapper.find('[data-cy="preview-title"]').text()).toBe(
      "preview.map-title",
    );
  });

  it("has one close button, also for a primary ColumnList preview", async () => {
    vi.mocked(apolloClient.query).mockResolvedValueOnce({
      data: { PreviewElement: PRIMARY_PREVIEW_ELEMENT },
    });
    const wrapper = getWrapper({
      type: PreviewTypes.ColumnList,
      previewQuery: "GetPreviewInArea",
    });
    await flushPromises();

    expect(wrapper.findAll(CLOSE_SELECTOR)).toHaveLength(1);
  });

  it("names the close button", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    expect(wrapper.find(CLOSE_SELECTOR).attributes("aria-label")).toBe(
      "preview-component.close",
    );
  });

  it("emits closePreviewComponent when the close button is clicked", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    await wrapper.find(CLOSE_SELECTOR).trigger("click");

    expect(wrapper.emitted("closePreviewComponent")).toBeTruthy();
  });

  it("opens the detail page from the header", async () => {
    const wrapper = getWrapper(
      { type: PreviewTypes.MediaViewer },
      { detailPath: "/inscriptions/e1" },
    );
    await flushPromises();
    const open = wrapper.find('[data-cy="preview-open-detail"]');

    expect(open.text()).toBe("preview-component.open-detail-page");
    await open.trigger("click");
    expect(router.push).toHaveBeenCalledWith("/inscriptions/e1");
  });

  it("offers no detail page when the list doesn't navigate", async () => {
    const wrapper = getWrapper({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    expect(wrapper.find('[data-cy="preview-open-detail"]').exists()).toBe(
      false,
    );
  });

  it("leaves focus alone when it opens by default on page load", async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    const wrapper = mountAttached({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    expect(document.activeElement).toBe(document.body);
    wrapper.unmount();
  });

  it("moves focus to its header when a control opens it", async () => {
    const eye = document.createElement("button");
    document.body.appendChild(eye);
    eye.focus();
    const wrapper = mountAttached({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    expect(document.activeElement).toBe(
      wrapper.find('[data-cy="preview-header"]').element,
    );
    wrapper.unmount();  eye.remove();
  });

  it("returns focus to the previewed row's eye after the list re-renders", async () => {
    const eye = document.createElement("button");
    eye.dataset.previewFor = "e1";
    document.body.appendChild(eye);
    const wrapper = mountAttached({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    await wrapper.find(CLOSE_SELECTOR).trigger("click");
    await flushPromises();

    expect(document.activeElement).toBe(eye);
    wrapper.unmount();
    eye.remove();
  });

  it("closes on Escape and returns focus to the control that opened it", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mountAttached({ type: PreviewTypes.MediaViewer });
    await flushPromises();

    await wrapper
      .find('[role="complementary"]')
      .trigger("keydown", { key: "Escape" });

    expect(wrapper.emitted("closePreviewComponent")).toBeTruthy();
    await flushPromises();
    expect(document.activeElement).toBe(opener);
    wrapper.unmount();
    opener.remove();
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

describe("PreviewWrapper forwarding relationType/parentEntityId for recrop", () => {
  const MediaViewerPreviewStub = {
    props: [
      "currentMediafile",
      "mediafiles",
      "mediafilesLoading",
      "entityId",
      "cropMediafileCoordinatesKey",
      "parentEntityId",
      "parentEntityType",
      "relationType",
      "refetchEntities",
    ],
    template: '<div class="media-stub" />',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards relationType and the first parentIds entry to MediaViewerPreview as relationType/parentEntityId", async () => {
    const wrapper = mount(PreviewWrapper, {
      props: {
        previewComponent: {
          type: PreviewTypes.MediaViewer,
          listItemsCoverage: ListItemCoverageTypes.OneListItem,
        },
        entityType: "asset",
        entities: [{ id: "e1" }],
        entitiesLoading: false,
        configPerViewMode: {},
        entityId: "e1",
        parentIds: ["parent-1", "parent-2"],
        cropMediafileCoordinatesKey: "coordinates",
        relationType: "refMediafiles",
      },
      global: {
        stubs: { ...stubs, MediaViewerPreview: MediaViewerPreviewStub },
      },
    });
    await flushPromises();

    const mediaViewerPreview = wrapper.findComponent(MediaViewerPreviewStub);
    expect(mediaViewerPreview.props("relationType")).toBe("refMediafiles");
    expect(mediaViewerPreview.props("parentEntityId")).toBe("parent-1");
  });

  it("forwards refetchEntities to MediaViewerPreview when provided", async () => {
    const refetchEntities = vi.fn().mockResolvedValue(undefined);
    const wrapper = mount(PreviewWrapper, {
      props: {
        previewComponent: {
          type: PreviewTypes.MediaViewer,
          listItemsCoverage: ListItemCoverageTypes.OneListItem,
        },
        entityType: "asset",
        entities: [{ id: "e1" }],
        entitiesLoading: false,
        configPerViewMode: {},
        entityId: "e1",
        parentIds: ["parent-1"],
        cropMediafileCoordinatesKey: "coordinates",
        refetchEntities,
      },
      global: {
        stubs: { ...stubs, MediaViewerPreview: MediaViewerPreviewStub },
      },
    });
    await flushPromises();

    const mediaViewerPreview = wrapper.findComponent(MediaViewerPreviewStub);
    expect(mediaViewerPreview.props("refetchEntities")).toBe(refetchEntities);
  });

  it("forwards parentEntityType to MediaViewerPreview when provided", async () => {
    const wrapper = mount(PreviewWrapper, {
      props: {
        previewComponent: {
          type: PreviewTypes.MediaViewer,
          listItemsCoverage: ListItemCoverageTypes.OneListItem,
        },
        entityType: "asset",
        entities: [{ id: "e1" }],
        entitiesLoading: false,
        configPerViewMode: {},
        entityId: "e1",
        parentIds: ["parent-1"],
        cropMediafileCoordinatesKey: "coordinates",
        parentEntityType: "inscription",
      },
      global: {
        stubs: { ...stubs, MediaViewerPreview: MediaViewerPreviewStub },
      },
    });
    await flushPromises();

    const mediaViewerPreview = wrapper.findComponent(MediaViewerPreviewStub);
    expect(mediaViewerPreview.props("parentEntityType")).toBe("inscription");
  });
});

describe("PreviewWrapper parent entity provide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides the previewed entity so filters can resolve $entity references", async () => {
    const entity = { id: "e1", relationValues: { refProduction: [{ key: "PR-1" }] } };
    const injector = {
      inject: { parentEntity: { from: "ParentEntityProvider", default: undefined } },
      template: '<div class="injector-stub" />',
    };
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { PreviewElement: PRIMARY_PREVIEW_ELEMENT },
    });
    const wrapper = mount(PreviewWrapper, {
      props: {
        previewComponent: {
          listItemsCoverage: ListItemCoverageTypes.OneListItem,
          type: PreviewTypes.ColumnList,
          metadataPreviewQuery: "GetMetadataPreviewForNotification",
        },
        entityType: "notification",
        entities: [entity],
        entitiesLoading: false,
        configPerViewMode: {},
        entityId: "e1",
        parentIds: [],
        cropMediafileCoordinatesKey: "",
      },
      global: { stubs: { ...stubs, EntityColumn: injector } },
    });
    await flushPromises();

    const injected = wrapper.findComponent(injector).vm.parentEntity;
    expect(injected?.value ?? injected).toEqual(entity);
  });
});
