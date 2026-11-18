import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import BaseLibrary from "../BaseLibrary.vue";
import {
  BaseLibraryModes,
  Entitytyping,
  ViewModes,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { registerQueryFixture, router } from "@/main";
import { registerLibraryFixtures } from "./libraryFixtures";
import { registerFilterFixtures } from "@/components/filters/__stories__/filterFixtures";

type ViewModeConfig = { viewMode: ViewModes; config?: unknown[] };

const ALL_MODES: ViewModeConfig[] = [
  { viewMode: ViewModes.ViewModesList },
  { viewMode: ViewModes.ViewModesGrid },
  { viewMode: ViewModes.Table },
];

const MAP_MODE: ViewModeConfig = {
  viewMode: ViewModes.ViewModesMap,
  config: [
    { __typename: "ConfigItem", key: "mapType", value: "pointsMap" },
    { __typename: "ConfigItem", key: "mapView", value: "standard" },
    { __typename: "ConfigItem", key: "center", value: [51.3, 3.5] },
    {
      __typename: "ConfigItem",
      key: "pointsConfig",
      value: { keyToExtractCoordinates: "location", clustering: false },
    },
  ],
};

const PIPELINE_MODE: ViewModeConfig = {
  viewMode: ViewModes.ViewModesPipeline,
  config: [
    {
      __typename: "ConfigItem",
      key: "edgeRelations",
      value: ["ref_work", "ref_expression"],
    },
  ],
};

const RECORDS = [
  {
    id: "a-1",
    title: "Tales from the North Sea",
    author: "Jan Persoon",
    year: "1987",
    location: { latitude: 51.23, longitude: 2.92 },
    relations: {},
  },
  {
    id: "a-2",
    title: "Coastal Fishing in the 20th Century",
    author: "Marie Vermeulen",
    year: "2004",
    location: { latitude: 51.33, longitude: 3.2 },
    relations: { ref_work: [{ key: "a-1" }] },
  },
  {
    id: "a-3",
    title: "A Book of Hours of the Scheldt",
    author: "Pieter Claes",
    year: "1512",
    location: { latitude: 51.44, longitude: 3.57 },
    relations: { ref_expression: [{ key: "a-2" }] },
  },
  {
    id: "a-4",
    title: "Lighthouses of the Flemish Coast",
    author: "Marie Vermeulen",
    year: "1999",
    location: { latitude: 51.22, longitude: 4.4 },
    relations: { ref_expression: [{ key: "a-2" }] },
  },
  {
    id: "a-5",
    title: "The Harbour at Dawn",
    author: "Jan Persoon",
    year: "1962",
    location: { latitude: 51.44, longitude: 4.0 },
    relations: { ref_work: [{ key: "a-1" }] },
  },
];

const label = (key: string, text: string, value: string) => ({
  __typename: "PanelMetaData",
  key,
  label: text,
  value,
});

const asset = (record: (typeof RECORDS)[number], modes: ViewModeConfig[]) => ({
  __typename: "Asset",
  id: record.id,
  uuid: record.id,
  type: "asset",
  intialValues: {
    __typename: "IntialValues",
    title: record.title,
    author: record.author,
    year: record.year,
    location: record.location,
  },
  relationValues: record.relations,
  allowedViewModes: {
    __typename: "AllowedViewModes",
    viewModes: modes.map(({ viewMode, config }) => ({
      __typename: "ViewModesWithConfig",
      viewMode,
      config: config ?? [],
    })),
  },
  teaserMetadata: {
    __typename: "teaserMetadata",
    title: label("title", "Title", record.title),
    author: label("author", "Author", record.author),
    year: label("year", "Year", record.year),
  },
});

const setupLibrary = (modes: ViewModeConfig[]) => {
  registerLibraryFixtures();
  registerFilterFixtures();
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: { __typename: "Asset" },
  });
  registerQueryFixture("getPreviewComponents", {
    PreviewComponents: { __typename: "Asset", previewComponent: null },
  });
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: RECORDS.length,
      limit: 20,
      facets: [],
      results: RECORDS.map((record) => asset(record, modes)),
    },
  });
  if (!router.hasRoute("SingleEntity"))
    router.addRoute({
      name: "SingleEntity",
      path: "/entity/:type/:id",
      component: { template: "<div />" },
    });
};

const render = (modes: ViewModeConfig[], height = "460px") => () => ({
  components: { BaseLibrary },
  setup() {
    setupLibrary(modes);
    provide("config", {
      features: { hasBulkSelect: true, hasBulkOperations: true },
      routerConfig: [{ name: "Home", children: [] }],
    });
    useBulkOperations().dequeueAllItemsForBulkProcessing(
      BulkOperationsContextEnum.Home,
    );
    return {
      height,
      BulkOperationsContextEnum,
      BaseLibraryModes,
      Entitytyping,
    };
  },
  template: `
    <div :style="{ height }">
      <base-library
        id="story-library"
        :bulk-operations-context="BulkOperationsContextEnum.Home"
        list-item-route-name="SingleEntity"
        :entity-type="Entitytyping.Asset"
        :filter-type="Entitytyping.Asset"
        :base-library-mode="BaseLibraryModes.NormalBaseLibrary"
        :has-sticky-bars="false"
        :should-use-state-for-route="false"
      />
    </div>`,
});

const press = async (...names: string[]) => {
  for (const name of names) {
    for (let i = 0; i < 160; i++) {
      const button = [
        ...document.querySelectorAll<HTMLElement>("[role=group] button"),
      ].find(
        (candidate) =>
          candidate.getAttribute("aria-label") === name ||
          candidate.textContent?.trim() === name,
      );
      if (button) {
        button.click();
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const meta: Meta<typeof BaseLibrary> = {
  title: "Library/BaseLibrary",
  component: BaseLibrary,
  parameters: {
    docs: {
      description: {
        component:
          "The library with its results band. The view modes come from the " +
          "first record's allowedViewModes, in the order the query lists " +
          "them; the band shows a View switch when there is more than one.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseLibrary>;

/** Every mode allowed, in the query's order. */
export const ViewSwitch: Story = {
  name: "View switch",
  render: render([...ALL_MODES, MAP_MODE, PIPELINE_MODE], "380px"),
  play: () => press("List view"),
};

export const List: Story = {
  render: render(ALL_MODES, "380px"),
  play: () => press("List view"),
};

/** The grid, with the Large | Compact card-size switch next to the View switch. */
export const Grid: Story = {
  render: render(ALL_MODES, "900px"),
  play: () => press("Grid view", "Large"),
};

export const GridCompact: Story = {
  name: "Grid, compact",
  render: render(ALL_MODES, "560px"),
  play: () => press("Grid view", "Compact"),
};

export const Table: Story = {
  render: render(ALL_MODES, "380px"),
  play: () => press("Table view"),
};

export const Map: Story = {
  render: render([{ viewMode: ViewModes.ViewModesList }, MAP_MODE], "480px"),
  play: () => press("Map view"),
};

export const Pipeline: Story = {
  render: render(
    [{ viewMode: ViewModes.ViewModesList }, PIPELINE_MODE],
    "560px",
  ),
  play: () => press("Pipeline view"),
};
