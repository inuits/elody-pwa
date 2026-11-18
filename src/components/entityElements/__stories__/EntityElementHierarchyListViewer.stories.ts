import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityElement from "../EntityElement.vue";
import EntityElementHierarchyListViewer from "../EntityElementHierarchyListViewer.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useStateManagement } from "@/composables/useStateManagement";
import { ViewModes } from "@/generated-types/queries";
import { PENDING_QUERY, registerQueryFixture, router } from "@/main";
import { registerLibraryFixtures } from "@/components/library/__stories__/libraryFixtures";
import { registerFilterFixtures } from "@/components/filters/__stories__/filterFixtures";

type Level = {
  type: string;
  typeLabel: string;
  name: string;
  latitude: number;
  longitude: number;
  wkt: string;
  parent?: { key: string; id: string };
};

const LEVELS: Record<string, Level> = {
  "region-attica": {
    type: "region",
    typeLabel: "Region",
    name: "Attica",
    latitude: 38.0,
    longitude: 23.75,
    wkt: "POLYGON((23.55 37.85, 24.05 37.85, 24.05 38.2, 23.55 38.2, 23.55 37.85))",
  },
  "area-athens": {
    type: "area",
    typeLabel: "Area",
    name: "Athens",
    latitude: 37.9755,
    longitude: 23.7348,
    wkt: "POLYGON((23.69 37.95, 23.77 37.95, 23.77 38.0, 23.69 38.0, 23.69 37.95))",
    parent: { key: "ref_region", id: "region-attica" },
  },
  "site-acropolis": {
    type: "site",
    typeLabel: "Site",
    name: "Acropolis",
    latitude: 37.9715,
    longitude: 23.7262,
    wkt: "POLYGON((23.722 37.970, 23.730 37.970, 23.730 37.973, 23.722 37.973, 23.722 37.970))",
    parent: { key: "ref_area", id: "area-athens" },
  },
  "point-erechtheion": {
    type: "point",
    typeLabel: "Point",
    name: "Erechtheion, north porch",
    latitude: 37.972,
    longitude: 23.7265,
    wkt: "POINT(23.7265 37.972)",
    parent: { key: "ref_site", id: "site-acropolis" },
  },
};

const field = (key: string, label: string, value: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
  value,
});

const entity = (id: string, level: Level) => {
  const gps = `${level.latitude}, ${level.longitude}`;
  return {
    __typename: level.typeLabel,
    id,
    uuid: id,
    type: level.type,
    intialValues: {
      __typename: "IntialValues",
      id,
      name: level.name,
      title: level.name,
      gps_coordinates: {
        latitude: level.latitude,
        longitude: level.longitude,
      },
      map_location: level.wkt,
    },
    relationValues: level.parent
      ? { [level.parent.key]: [{ key: level.parent.id }] }
      : {},
    allowedViewModes: {
      __typename: "AllowedViewModes",
      viewModes: [
        {
          __typename: "ViewModesWithConfig",
          viewMode: ViewModes.ViewModesList,
          config: [],
        },
        {
          __typename: "ViewModesWithConfig",
          viewMode: ViewModes.ViewModesMap,
          config: [{ __typename: "ConfigItem", key: "mapType", value: "wktMap" }],
        },
      ],
    },
    teaserMetadata: {
      __typename: "teaserMetadata",
      name: field("name", "Name", level.name),
      type: { ...field("type", "Type", ""), customValue: level.typeLabel },
      gps_coordinates: field("gps_coordinates", "GPS coordinates", gps),
    },
  };
};

const element = {
  __typename: "HierarchyListElement",
  label: "Hierarchy",
  isCollapsed: false,
  customQuery: "GetEntityById",
  hierarchyRelationList: [
    { __typename: "HierarchyRelationList", key: "ref_point", entityType: "point" },
    { __typename: "HierarchyRelationList", key: "ref_site", entityType: "site" },
    { __typename: "HierarchyRelationList", key: "ref_area", entityType: "area" },
    { __typename: "HierarchyRelationList", key: "ref_region", entityType: "region" },
  ],
  entityTypeAsCenterPoint: "point",
  centerCoordinatesKey: "gps_coordinates",
};

const setup = (
  pointByRecord: Record<string, string>,
  unreadable: string[] = [],
) => {
  registerLibraryFixtures();
  registerFilterFixtures();
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: { __typename: "Asset" },
  });
  registerQueryFixture("getPreviewComponents", {
    PreviewComponents: { __typename: "Asset", previewComponent: null },
  });
  registerQueryFixture("getEntityById", ({ id }: { id: string }) => {
    if (id === "point-pending") return PENDING_QUERY;
    if (unreadable.includes(id) || !LEVELS[id]) return { Entity: null };
    return { Entity: entity(id, LEVELS[id]) };
  });
  if (!router.hasRoute("SingleEntity"))
    router.addRoute({
      name: "SingleEntity",
      path: "/entity/:type/:id",
      component: { template: "<div />" },
    });
  provide("config", {
    features: { hasBulkSelect: false, hasBulkOperations: false },
    routerConfig: [{ name: "Home", children: [] }],
  });
  useStateManagement().updateGlobalState("_displayPreferences", {
    grid: false,
    table: false,
    pipeline: false,
  });
  Object.entries(pointByRecord).forEach(([recordId, pointId]) =>
    useFormHelper().createForm(recordId, {
      intialValues: { title: "Dedication to Athena" },
      relationValues: { ref_point: [{ key: pointId }] },
    } as never),
  );
};

const panel = (recordId: string, height = "300px") => `
  <div style="max-width:640px;height:${height};display:flex">
    <entity-element
      id="${recordId}"
      :elements="elements"
      :identifiers="['${recordId}']"
      entity-type="inscription"
    />
  </div>`;

const pressViewSwitch = async (name: string) => {
  for (let i = 0; i < 160; i++) {
    const button = document.querySelector<HTMLElement>(
      `[role=group] button[aria-label="${name}"]`,
    );
    if (button) return button.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

const meta: Meta<typeof EntityElementHierarchyListViewer> = {
  title: "EntityElements/EntityElementHierarchyListViewer",
  component: EntityElementHierarchyListViewer,
  parameters: {
    docs: {
      description: {
        component:
          "The record's chain of parents, read one relation at a time " +
          "(point, site, area, region) and listed from the top level down, " +
          "in a panel on the detail page.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementHierarchyListViewer>;

/** An inscription: its region, area, site and point, top level first. */
export const Default: Story = {
  render: () => ({
    components: { EntityElement },
    setup() {
      setup({ "inscription-1": "point-erechtheion" });
      return { elements: { hierarchyList: element } };
    },
    template: panel("inscription-1"),
  }),
};

/** The area cannot be read, so the chain stops at the site. */
export const ShorterChain: Story = {
  name: "Shorter chain",
  render: () => ({
    components: { EntityElement },
    setup() {
      setup({ "inscription-2": "point-erechtheion" }, ["area-athens"]);
      return { elements: { hierarchyList: element } };
    },
    template: panel("inscription-2", "220px"),
  }),
};

/** The same parents on the map, centred on the point. */
export const Map: Story = {
  render: () => ({
    components: { EntityElement },
    setup() {
      setup({ "inscription-3": "point-erechtheion" });
      return { elements: { hierarchyList: element } };
    },
    template: panel("inscription-3", "460px"),
  }),
  play: () => pressViewSwitch("Map view"),
};

/** Loading while the parents are read; empty when the first parent cannot be read. */
export const States: Story = {
  render: () => ({
    components: { EntityElement },
    setup() {
      setup({
        "inscription-loading": "point-pending",
        "inscription-empty": "point-missing",
      });
      return { elements: { hierarchyList: element } };
    },
    template: `
      <div style="display:grid;gap:16px;max-width:640px">
        <div>
          <code>loading</code>
          <entity-element
            id="inscription-loading"
            :elements="elements"
            :identifiers="['inscription-loading']"
            entity-type="inscription"
          />
        </div>
        <div>
          <code>empty</code>
          <entity-element
            id="inscription-empty"
            :elements="elements"
            :identifiers="['inscription-empty']"
            entity-type="inscription"
          />
        </div>
      </div>`,
  }),
};
