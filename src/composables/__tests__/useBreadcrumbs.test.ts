import { describe, it, expect, vi } from "vitest";
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

describe("useBreadcrumbs", () => {
  it("Should have correct filters when creating them", async () => {
    const id = "test_id";
    const entityType = Entitytyping.BaseEntity;
    const relation = "hasBaseEntity";

    const createFiltersSpy = vi.spyOn(
      useBreadcrumbs(undefined),
      "createFilters",
    );
    const createdFilters = createFiltersSpy(id, entityType, relation);

    expect(createFiltersSpy).toHaveBeenCalledTimes(1);
    expect(createFiltersSpy).toHaveBeenCalledWith(id, entityType, relation);
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
      useBreadcrumbs(undefined),
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
      useBreadcrumbs(undefined),
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
