import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementMapViewer from "./EntityElementMapViewer.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { MapTypes, type MapElement } from "@/generated-types/queries";

// The map element reads its WKT geometry and center point from the entity's
// form values (by the metadata keys declared on the element). The story seeds
// that form so an OpenLayers map with a marker and polygon can render.
const ENTITY_ID = "sampling-station-storybook-1";

const wktMapElement = {
  __typename: "MapElement",
  label: "Sampling location",
  isCollapsed: false,
  type: MapTypes.WktMap,
  center: "center_coordinates",
  config: [],
  geoLocation: {
    __typename: "PanelMetaData",
    key: "location_wkt",
    label: "Geometry",
  },
} as unknown as MapElement;

const meta: Meta<typeof EntityElementMapViewer> = {
  title: "EntityElements/EntityElementMapViewer",
  component: EntityElementMapViewer,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementMapViewer },
    setup: () => {
      const { getForm, createForm } = useFormHelper();
      if (!getForm(ENTITY_ID))
        createForm(ENTITY_ID, {
          intialValues: {
            center_coordinates: { latitude: 51.226, longitude: 2.918 },
            location_wkt:
              "POLYGON((2.85 51.2, 2.98 51.2, 2.98 51.26, 2.85 51.26, 2.85 51.2))",
          },
          relationValues: {},
        } as any);
      return { args };
    },
    template:
      '<div class="max-w-4xl p-4"><EntityElementMapViewer v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementMapViewer>;

export const WktMap: Story = {
  args: {
    element: wktMapElement,
    entityId: ENTITY_ID,
  },
};

export const Collapsed: Story = {
  args: {
    element: { ...wktMapElement, isCollapsed: true } as unknown as MapElement,
    entityId: ENTITY_ID,
  },
};

export const WithoutGeometry: Story = {
  args: {
    element: {
      __typename: "MapElement",
      label: "Sampling location",
      isCollapsed: false,
      type: MapTypes.WktMap,
      center: "unknown_key",
      config: [],
    } as unknown as MapElement,
    entityId: "entity-without-map-form",
  },
};
