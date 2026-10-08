import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryWindowPanelContent from "../EntityHistoryWindowPanelContent.vue";
import { Unit } from "@/generated-types/queries";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const formValues = vi.hoisted(() => ({
  intialValues: {} as Record<string, any>,
}));
const customization = vi.hoisted(() => ({ hideEmptyFields: false }));
vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: (key: string) =>
      key === "config" ? { features: {}, customization } : actual.inject(key),
  };
});
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: () => ({ values: formValues }),
  }),
}));

const coordinateField = {
  __typename: "PanelMetaData",
  key: "location",
  label: "Location",
  value: null,
  unit: Unit.CoordinatesDefault,
  inputField: { type: "location" },
  permitted: false,
};

describe("EntityHistoryWindowPanelContent", () => {
  it("passes the graphql-resolved permitted flag to the coordinate field", () => {
    const wrapper = mount(EntityHistoryWindowPanelContent, {
      props: {
        relationArray: [],
        metadatafields: [coordinateField] as any,
        canBeMultipleColumns: false,
        formId: "1",
        identifiers: [],
        parentIsListItem: false,
        wysiwygDiffs: [],
        relationDiffs: [],
      },
      global: {
        provide: { config: { customization: {} } },
        stubs: {
          MultilingualWrapper: {
            template: '<slot :localized-metadata="null" />',
          },
          MetadataWrapper: true,
          EntityElementCoordinateEdit: {
            name: "EntityElementCoordinateEdit",
            props: ["permitted"],
            template: "<div />",
          },
        },
      },
    });

    const coordinateEdit = wrapper.findComponent({
      name: "EntityElementCoordinateEdit",
    });
    expect(coordinateEdit.exists()).toBe(true);
    expect(coordinateEdit.props("permitted")).toBe(false);
  });

  describe("hiding empty fields", () => {
    const field = (key: string, value: unknown) => ({
      __typename: "PanelMetaData",
      key,
      label: key,
      value,
    });

    const mountWith = (
      metadatafields: any[],
      intialValues: Record<string, any>,
      hideEmptyFields: boolean,
    ) => {
      formValues.intialValues = intialValues;
      customization.hideEmptyFields = hideEmptyFields;
      return mount(EntityHistoryWindowPanelContent, {
        props: {
          relationArray: [],
          metadatafields: metadatafields as any,
          canBeMultipleColumns: false,
          formId: "1",
          identifiers: [],
          parentIsListItem: false,
          wysiwygDiffs: [],
          relationDiffs: [],
        },
        global: {
          stubs: {
            MultilingualWrapper: {
              template: '<slot :localized-metadata="null" />',
            },
            MetadataWrapper: {
              name: "MetadataWrapper",
              props: ["metadata"],
              template: "<div />",
            },
          },
        },
      });
    };

    const shownKeys = (wrapper: ReturnType<typeof mountWith>) =>
      wrapper
        .findAllComponents({ name: "MetadataWrapper" })
        .map((component) => component.props("metadata").key);

    it("hides a field that is empty and unchanged when the client hides empty fields", () => {
      const wrapper = mountWith(
        [field("title", "Narnia"), field("subtitle", "")],
        { title: "Narnia", subtitle: "" },
        true,
      );

      expect(shownKeys(wrapper)).toEqual(["title"]);
    });

    it("keeps an empty field that changed, so the difference stays visible on both sides", () => {
      const wrapper = mountWith(
        [field("subtitle", "")],
        { subtitle: { formatter: "pill|modified", label: "" } },
        true,
      );

      expect(shownKeys(wrapper)).toEqual(["subtitle"]);
    });

    it("never hides a relation list, which fetches its own relations and carries no value", () => {
      const relationList = {
        __typename: "EntityListElement",
        relationType: "refAuthors",
        entityTypes: ["person", "corporation"],
      };
      formValues.intialValues = {};
      customization.hideEmptyFields = true;
      const wrapper = mount(EntityHistoryWindowPanelContent, {
        props: {
          relationArray: [],
          metadatafields: [relationList] as any,
          canBeMultipleColumns: false,
          formId: "1",
          identifiers: [],
          parentIsListItem: false,
          wysiwygDiffs: [],
          relationDiffs: [
            {
              relationType: "refAuthors",
              label: "Auteurs",
              items: [{ key: "PERS-1", label: "Lewis", status: "unchanged" }],
            },
          ],
        },
        global: {
          stubs: {
            MultilingualWrapper: {
              template: '<slot :localized-metadata="null" />',
            },
            HistoryRelationDiff: {
              name: "HistoryRelationDiff",
              template: "<div />",
            },
          },
        },
      });

      expect(
        wrapper.findComponent({ name: "HistoryRelationDiff" }).exists(),
      ).toBe(true);
    });

    it("shows empty fields when the client does not hide them", () => {
      const wrapper = mountWith(
        [field("subtitle", "")],
        { subtitle: "" },
        false,
      );

      expect(shownKeys(wrapper)).toEqual(["subtitle"]);
    });
  });

  it("shows the belongs-to block whenever the panel carries relations", () => {
    const wrapper = mount(EntityHistoryWindowPanelContent, {
      props: {
        relationArray: [{ __typename: "PanelRelation", label: "Lewis" }] as any,
        metadatafields: [],
        canBeMultipleColumns: false,
        formId: "1",
        identifiers: [],
        parentIsListItem: false,
        wysiwygDiffs: [],
        relationDiffs: [],
      },
      global: {
        provide: { config: { customization: {} } },
        stubs: { EntityElementRelation: true },
      },
    });

    expect(wrapper.text()).toContain("entity.belongs-to");
  });
});
