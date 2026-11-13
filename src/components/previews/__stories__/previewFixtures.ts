import { provide } from "vue";
import { registerQueryFixture } from "@/main";
import { Entitytyping } from "@/generated-types/queries";

const panel = (metaData: Record<string, unknown>) => ({
  __typename: "WindowElementPanel",
  isEditable: false,
  isCollapsed: false,
  metaData: { __typename: "PanelMetaData", ...metaData },
});

export const METADATA_PREVIEW_QUERY = "GetMetadataPreviewForMediafile";

export const registerPreviewFixtures = () => {
  registerQueryFixture(METADATA_PREVIEW_QUERY, {
    PreviewElement: {
      __typename: "ColumnList",
      column: {
        __typename: "Column",
        size: "hundred",
        elements: {
          __typename: "ColumnElements",
          windowElement: {
            __typename: "WindowElement",
            label: "Information",
            layout: null,
            original_filename: panel({
              label: "File name",
              key: "original_filename",
            }),
            license: panel({ key: "license" }),
            minimal_attribution: panel({
              label: "Attribution",
              key: "minimal_attribution",
            }),
          },
        },
      },
    },
  });
};

export const previewEntity = (
  id: string,
  values: Record<string, unknown>,
  relationValues: Record<string, unknown> = {},
) => ({
  __typename: "MediaFileEntity",
  id,
  uuid: id,
  type: Entitytyping.Mediafile,
  teaserMetadata: {},
  intialValues: { __typename: "IntialValues", ...values },
  relationValues,
});

export const providePreviewConfig = () =>
  provide("config", {
    features: {},
    customization: {},
    routerConfig: [{ name: "Home", children: [] }],
  });

export const CHANGES_RELATION = "isChangeOf";

export const registerChangedEntity = () =>
  registerQueryFixture("getEntityById", {
    Entity: previewEntity("m2", {
      original_filename: "harbour-1920-restored.tif",
      license: "CC0 1.0",
      minimal_attribution: "City Archive",
    }),
  });

export const changeRequest = previewEntity(
  "c1",
  {
    title: "Change request #41",
    changed_keys: ["original_filename", "license"],
    original_filename: "harbour-1920.tif",
    license: "CC BY 4.0",
    minimal_attribution: "City Archive",
  },
  { [CHANGES_RELATION]: [{ key: "m2", type: CHANGES_RELATION }] },
);

export const changesPreviewConfig = {
  query: METADATA_PREVIEW_QUERY,
  relationType: CHANGES_RELATION,
  changedKeysKey: "changed_keys",
  entityType: Entitytyping.Mediafile,
};
