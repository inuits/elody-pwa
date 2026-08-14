import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import {
  breadcrumbRoutes,
  rootRoute,
  useBreadcrumbs,
} from "@/composables/useBreadcrumbs";
import {
  AdvancedFilterTypes,
  Entitytyping,
  RouteNames,
  SearchInputType,
} from "@/generated-types/queries";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import type { TranslationEntry } from "@/composables/useMultilingualField";

const mocks = vi.hoisted(() => ({
  locale: { value: "en" },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: mocks.locale,
  }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, discard: vi.fn(), save: vi.fn() }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ discardEditForForm: vi.fn() }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ closeModal: vi.fn() }),
}));

vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: vi.fn().mockResolvedValue("cancel") }),
}));

const config = {
  features: {
    supportsMultilingualMetadataEditing: false,
    routerConfig: [],
  },
};

describe("useBreadcrumbs", () => {
  it("Should have correct filters when creating them", async () => {
    const id = "test_id";
    const entityType = Entitytyping.BaseEntity;
    const key = ["elody:1|relations.hasBaseEntity.key"];

    const createFiltersSpy = vi.spyOn(useBreadcrumbs(config), "createFilters");
    const createdFilters = createFiltersSpy(id, entityType, undefined, key);

    expect(createFiltersSpy).toHaveBeenCalledTimes(1);
    expect(createFiltersSpy).toHaveBeenCalledWith(id, entityType, undefined, key);
    expect(createFiltersSpy).toHaveReturned();
    expect(createdFilters).toEqual({
      type: "BaseEntity",
      limit: 20,
      skip: 1,
      searchValue: {
        value: "",
        isAsc: false,
        key: "title",
        order_by: "date_updated",
      },
      searchInputType: SearchInputType.AdvancedInputType,
      advancedSearchValue: [],
      advancedFilterInputs: [
        {
          match_exact: true,
          type: AdvancedFilterTypes.Type,
          value: entityType,
        },
        {
          match_exact: true,
          type: AdvancedFilterTypes.Selection,
          key: [`elody:1|relations.hasBaseEntity.key`],
          value: "test_id",
        },
      ],
    });
  });

  it("Should have a root route title when clearing breadcrumb path and adding overview page", async () => {
    const title = "this_is_an_overviewpage test";

    expect(breadcrumbRoutes.value).toEqual([]);
    breadcrumbRoutes.value = [
      {
        title: "SingleEntity",
        overviewPage: "SingleEntity",
      },
    ];
    expect(breadcrumbRoutes.value).toEqual([
      {
        title: "SingleEntity",
        overviewPage: "SingleEntity",
      },
    ]);

    const clearBreadcrumbPathAndAddOverviewPageSpy = vi.spyOn(
      useBreadcrumbs(config),
      "clearBreadcrumbPathAndAddOverviewPage",
    );
    clearBreadcrumbPathAndAddOverviewPageSpy(title);

    expect(clearBreadcrumbPathAndAddOverviewPageSpy).toHaveBeenCalledTimes(1);
    expect(clearBreadcrumbPathAndAddOverviewPageSpy).toHaveBeenCalledWith(
      "this_is_an_overviewpage test",
    );
    expect(clearBreadcrumbPathAndAddOverviewPageSpy).toHaveReturned();
    expect(breadcrumbRoutes.value).toEqual([]);
    expect(rootRoute.value.rootId).toEqual(undefined);
    expect(rootRoute.value.rootTitle).toEqual("this_is_an_overviewpage test");
  });

  it("Should have an overviewPage in the breadcrumbroutes after adding them", async () => {
    expect(breadcrumbRoutes.value).toEqual([]);

    const breadcrumbs = [
      {
        relation: "hasAsset",
        entityType: Entitytyping.Set,
      },
      {
        relation: "isCreatorFor",
        entityType: Entitytyping.Creator,
      },
      {
        relation: "hasAsset",
        entityType: Entitytyping.AssetPart,
      },
      {
        relation: "isInstitutionFor",
        entityType: Entitytyping.Institution,
      },
      {
        overviewPage: RouteNames.SingleEntity,
      },
    ];

    const addOverviewPageToBreadcrumbSpy = vi.spyOn(
      useBreadcrumbs(config),
      "addOverviewPageToBreadcrumb",
    );
    addOverviewPageToBreadcrumbSpy(breadcrumbs);

    expect(addOverviewPageToBreadcrumbSpy).toHaveBeenCalledTimes(1);
    expect(addOverviewPageToBreadcrumbSpy).toHaveBeenCalledWith(breadcrumbs);
    expect(addOverviewPageToBreadcrumbSpy).toHaveReturned();
    expect(breadcrumbRoutes.value).toEqual([
      {
        title: "SingleEntity",
        overviewPage: "SingleEntity",
      },
    ]);
  });

  it("Should store a TranslationEntry array as rootTitle via setRootRoute", () => {
    const translations: TranslationEntry[] = [
      { key: "title", value: "English title", lang: "en" },
      { key: "title", value: "Nederlandse titel", lang: "nl" },
    ];

    useBreadcrumbs(config).setRootRoute("root-id", translations as any);

    expect(rootRoute.value.rootTitle).toEqual(translations);
  });

  it("Should get correct breadcrumbs based on config", async () => {
    const config = {
      routerConfig: [
        {
          path: "/",
          name: "Home",
          component: {
            _custom: {
              type: "component-definition",
              display: "HomeWrapper",
              tooltip: "Component definition",
              file: "/app/inuits-dams-pwa/src/views/HomeWrapper.vue",
            },
          },
          meta: {
            title: "Home",
            type: "entities",
            requiresAuth: true,
            entityType: "archivalCollection",
            breadcrumbs: [
              {
                overviewPage: "ArchivalCollections",
              },
            ],
          },
          children: [
            {
              path: ":type/:id",
              name: "SingleEntity",
              component: {
                _custom: {
                  type: "component-definition",
                  display: "SingleEntity",
                  tooltip: "Component definition",
                  file: "/app/inuits-dams-pwa/src/views/SingleEntity.vue",
                },
              },
              meta: {
                title: "Single Entity",
                requiresAuth: true,
              },
            },
            {
              path: "documents",
              name: "Documents",
              component: {
                _custom: {
                  type: "component-definition",
                  display: "Home",
                  tooltip: "Component definition",
                  file: "/app/inuits-dams-pwa/src/views/Home.vue",
                },
              },
              meta: {
                title: "navigation.documents",
                requiresAuth: true,
                type: "entities",
                entityType: "document",
                breadcrumbs: [
                  {
                    relation: "hasDocument",
                    entityType: "collectionPart",
                  },
                  {
                    relation: "hasDocument",
                    entityType: "set",
                  },
                  {
                    relation: "isContentDocumentTypeFor",
                    entityType: "contentDocumentType",
                  },
                  {
                    relation: "isFormalDocumentTypeFor",
                    entityType: "formalDocumentType",
                  },
                  {
                    overviewPage: "Documents",
                  },
                ],
              },
            },
          ],
        },
        {},
        {},
      ],
    };

    const getRouteBreadcrumbsOfEntitySpy = vi.spyOn(
      useBreadcrumbs(config),
      "getRouteBreadcrumbsOfEntity",
    );
    const routeBreadcrumbs = getRouteBreadcrumbsOfEntitySpy("document");

    expect(getRouteBreadcrumbsOfEntitySpy).toHaveBeenCalledTimes(1);
    expect(getRouteBreadcrumbsOfEntitySpy).toHaveReturned();
    expect(routeBreadcrumbs).toEqual([
      {
        relation: "hasDocument",
        entityType: "collectionPart",
      },
      {
        relation: "hasDocument",
        entityType: "set",
      },
      {
        relation: "isContentDocumentTypeFor",
        entityType: "contentDocumentType",
      },
      {
        relation: "isFormalDocumentTypeFor",
        entityType: "formalDocumentType",
      },
      {
        overviewPage: "Documents",
      },
    ]);
  });
});

describe("BreadCrumbs multilingual title resolution", () => {
  const mountBreadCrumbs = () =>
    shallowMount(BreadCrumbs, {
      global: {
        provide: {
          config: { features: { supportsMultilingualMetadataEditing: false } },
        },
        stubs: { unicon: true },
      },
    });

  beforeEach(() => {
    mocks.locale.value = "en";
    rootRoute.value = {} as any;
    breadcrumbRoutes.value = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the value for the current locale when rootTitle is a TranslationEntry array", () => {
    rootRoute.value.rootTitle = [
      { key: "title", value: "English title", lang: "en" },
      { key: "title", value: "Nederlandse titel", lang: "nl" },
    ] as TranslationEntry[];
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toContain("English title");
    expect(wrapper.text()).not.toContain("Nederlandse titel");
  });

  it("shows the value for the nl locale when locale is nl and rootTitle is a TranslationEntry array", () => {
    mocks.locale.value = "nl";
    rootRoute.value.rootTitle = [
      { key: "title", value: "English title", lang: "en" },
      { key: "title", value: "Nederlandse titel", lang: "nl" },
    ] as TranslationEntry[];
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toContain("Nederlandse titel");
    expect(wrapper.text()).not.toContain("English title");
  });

  it("falls back to the first entry when no translation matches the current locale", () => {
    mocks.locale.value = "fr";
    rootRoute.value.rootTitle = [
      { key: "title", value: "English title", lang: "en" },
      { key: "title", value: "Nederlandse titel", lang: "nl" },
    ] as TranslationEntry[];
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toContain("English title");
  });

  it("passes a string rootTitle through t()", () => {
    rootRoute.value.rootTitle = "navigation.home";
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toContain("navigation.home");
  });

  it("shows empty string when rootTitle is undefined", () => {
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toBe("");
  });

  it("shows the previousRoute title for the matching locale when it is a TranslationEntry array", () => {
    mocks.locale.value = "nl";
    breadcrumbRoutes.value = [
      {
        id: "123",
        type: "entity",
        overviewPage: "Home",
        title: [
          { key: "title", value: "Previous English", lang: "en" },
          { key: "title", value: "Vorig Nederlands", lang: "nl" },
        ] as TranslationEntry[],
      },
    ];
    const wrapper = mountBreadCrumbs();
    expect(wrapper.text()).toContain("Vorig Nederlands");
    expect(wrapper.text()).not.toContain("Previous English");
  });
});
