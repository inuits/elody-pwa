import EntityPickerComponent from "../EntityPickerComponent.vue";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import SearchBar from "@/components/SearchBar.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { EntityPickerMode } from "@/generated-types/queries";

vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    addMediafileSelectionStateContext: vi.fn(),
  }),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  BulkOperationsContextEnum: {
    EntityElementListEntityPickerModal: "EntityElementListEntityPickerModal",
    EntityElementMediaEntityPickerModal: "EntityElementMediaEntityPickerModal",
  },
  useBulkOperations: () => ({
    enqueueItemForBulkProcessing: vi.fn(),
    dequeueAllItemsForBulkProcessing: vi.fn(),
    setBulkSelectionLimit: vi.fn(),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

vi.mock("@/composables/useCustomQuery", () => ({
  useCustomQuery: () => ({
    loadDocument: vi.fn(),
    getDocument: vi.fn(() => undefined),
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    closeModal: vi.fn(),
    getModalInfo: vi.fn(() => ({ parentEntity: null, open: false })),
    changeCloseConfirmation: vi.fn(),
  }),
}));

const formHelperMocks = vi.hoisted(() => ({
  addRelations: vi.fn(),
  replaceRelationsFromSameType: vi.fn(),
}));

const pickerModalMocks = vi.hoisted(() => ({
  replaceExistingRelations: false,
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    addRelations: formHelperMocks.addRelations,
    replaceRelationsFromSameType: formHelperMocks.replaceRelationsFromSameType,
    parseFormValuesToFormInput: vi.fn(),
    getForm: vi.fn(() => null),
  }),
}));

vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({
    getEntityId: vi.fn(() => "entity-1"),
    getRelationType: vi.fn(() => "refExpressions"),
    getRefetchEntitiesFunction: vi.fn(() => null),
    getActionsOnResult: vi.fn(() => undefined),
    setCropMode: vi.fn(),
    setCropCoordinatesKey: vi.fn(),
    getReplaceExistingRelations: vi.fn(
      () => pickerModalMocks.replaceExistingRelations,
    ),
  }),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displayWarningNotification: vi.fn(),
    displaySuccessNotification: vi.fn(),
  }),
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({
    isEdit: false,
    isDisabled: false,
    clickButton: vi.fn(),
    save: vi.fn(),
    setSubmitFunction: vi.fn(),
  }),
}));

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => ({ getCallbackFunctions: vi.fn(() => []) }),
}));

vi.mock("@/helpers", () => ({
  getChildrenOfHomeRoutes: vi.fn(() => []),
}));

vi.mock("vee-validate", () => ({
  useSubmitForm: (fn: any) => fn,
}));

vi.mock("dequal", () => ({ dequal: vi.fn(() => true) }));

const defaultProps = {
  entityUuid: "uuid-1",
  acceptedTypes: ["venue"],
  customQuery: "GetVenue",
  showButton: true,
  enableBulkOperations: true,
  enableAdvancedFilters: true,
  entityPickerMode: EntityPickerMode.Emit,
};

const globalConfig = {
  provide: { config: { features: {} } },
};

describe("EntityPickerComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pickerModalMocks.replaceExistingRelations = false;
  });

  describe("saveRelations relation-persist strategy", () => {
    const saveProps = {
      ...defaultProps,
      entityPickerMode: EntityPickerMode.Save,
      parentEntityType: "manifestation",
    };
    const selected = [{ id: "E-new", teaserMetadata: [] }] as any;

    it("appends via addRelations when replaceExistingRelations is false", async () => {
      const wrapper = shallowMount(EntityPickerComponent, {
        props: saveProps,
        global: globalConfig,
      });
      await flushPromises();
      wrapper.findComponent(BaseLibrary).vm.$emit("confirm-selection", selected);
      await flushPromises();

      expect(formHelperMocks.addRelations).toHaveBeenCalledWith(
        selected,
        "refExpressions",
        "entity-1",
        true,
      );
      expect(
        formHelperMocks.replaceRelationsFromSameType,
      ).not.toHaveBeenCalled();
    });

    it("swaps via replaceRelationsFromSameType when replaceExistingRelations is true", async () => {
      pickerModalMocks.replaceExistingRelations = true;
      const wrapper = shallowMount(EntityPickerComponent, {
        props: saveProps,
        global: globalConfig,
      });
      await flushPromises();
      wrapper.findComponent(BaseLibrary).vm.$emit("confirm-selection", selected);
      await flushPromises();

      expect(formHelperMocks.replaceRelationsFromSameType).toHaveBeenCalledWith(
        selected,
        "refExpressions",
        "entity-1",
      );
      expect(formHelperMocks.addRelations).not.toHaveBeenCalled();
    });
  });

  it("does not render SearchBar when searchMode is Filters (default)", () => {
    const wrapper = shallowMount(EntityPickerComponent, {
      props: defaultProps,
      global: globalConfig,
    });
    expect(wrapper.findComponent(SearchBar).exists()).toBe(false);
  });

  it("renders SearchBar above BaseLibrary when searchMode is Search", () => {
    const wrapper = shallowMount(EntityPickerComponent, {
      props: { ...defaultProps, searchMode: "Search" as any },
      global: globalConfig,
    });
    expect(wrapper.findComponent(SearchBar).exists()).toBe(true);
  });

  it("passes enableAdvancedFilters=false to BaseLibrary when searchMode is Search", async () => {
    const wrapper = shallowMount(EntityPickerComponent, {
      props: {
        ...defaultProps,
        searchMode: "Search" as any,
        enableAdvancedFilters: true,
      },
      global: globalConfig,
    });
    await flushPromises();
    const library = wrapper.findComponent(BaseLibrary);
    expect(library.props("enableAdvancedFilters")).toBe(false);
  });

  it("passes enableAdvancedFilters=true to BaseLibrary when searchMode is Filters", async () => {
    const wrapper = shallowMount(EntityPickerComponent, {
      props: {
        ...defaultProps,
        searchMode: "Filters" as any,
        enableAdvancedFilters: true,
      },
      global: globalConfig,
    });
    await flushPromises();
    const library = wrapper.findComponent(BaseLibrary);
    expect(library.props("enableAdvancedFilters")).toBe(true);
  });

  it("SearchBar stub appears before BaseLibrary stub in template", async () => {
    const wrapper = shallowMount(EntityPickerComponent, {
      props: { ...defaultProps, searchMode: "Search" as any },
      global: globalConfig,
    });
    await flushPromises();
    const html = wrapper.html();
    const searchBarPos = html.indexOf('search-bar');
    const libraryPos = html.indexOf('base-library');
    expect(searchBarPos).toBeGreaterThan(-1);
    expect(libraryPos).toBeGreaterThan(-1);
    expect(searchBarPos).toBeLessThan(libraryPos);
  });
});
