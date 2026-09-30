import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryWindowPanelContent from "../EntityHistoryWindowPanelContent.vue";
import { PanelType, Unit } from "@/generated-types/queries";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));

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
        panelType: PanelType.Metadata,
        relationArray: [],
        metadatafields: [coordinateField] as any,
        canBeMultipleColumns: false,
        formId: "1",
        isEdit: false,
        editState: { showErrors: false },
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

});
