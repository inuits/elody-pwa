import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityColumn from "../EntityColumn.vue";
import {
  ColumnSizes,
  InputFieldTypes,
  Orientations,
  PanelType,
  RouteNames,
} from "@/generated-types/queries";

const meta: Meta<typeof EntityColumn> = {
  title: "EntityElements/EntityColumn",
  component: EntityColumn,
  parameters: {
    docs: {
      description: {
        component:
          "The columns of a detail page, each sized by its configuration. " +
          "A panel with an expand button splits a two-column page 50/50; " +
          "clicking the button again restores the configured sizes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityColumn>;

const field = (key: string, label: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
  inputField: { type: InputFieldTypes.Text, label },
});

const panel = (label: string, fields: [string, string][]) => ({
  __typename: "WindowElementPanel",
  panelType: PanelType.Metadata,
  isCollapsed: false,
  isEditable: true,
  canBeMultipleColumns: false,
  panelHeaderContent: { label },
  ...Object.fromEntries(fields.map(([key, label]) => [key, field(key, label)])),
});

const columnList = {
  column: {
    __typename: "Column",
    size: ColumnSizes.Seventy,
    elements: {
      windowElement: {
        __typename: "WindowElement",
        label: "Information",
        expandButtonOptions: { shown: true, orientation: Orientations.Left },
        info: panel("General", [
          ["name", "Name"],
          ["status", "Status"],
          ["description", "Description"],
        ]),
        contact: panel("Online", [
          ["website", "Website"],
          ["instagram", "Instagram"],
        ]),
      },
    },
  },
  column2: {
    __typename: "Column",
    size: ColumnSizes.Thirty,
    elements: {
      windowElement: {
        __typename: "WindowElement",
        label: "Organisation type",
        organizationType: panel("Type", [
          ["is_venue", "Venue"],
          ["is_producer", "Producer"],
        ]),
      },
    },
  },
};

const intialValues = {
  name: "Harbourside Arts Centre",
  status: "Active",
  description: "Arts centre for theatre, music and literature by the harbour.",
  website: "https://www.example.org/harbourside",
  instagram: "@harbourside",
  is_venue: "Yes",
  is_producer: "No",
  canUpdate: true,
  canDelete: false,
};

const story = (id: string): Story => ({
  render: () => ({
    components: { EntityColumn },
    setup() {
      provide("config", {
        routerConfig: [{ name: RouteNames.Home, children: [] }],
      });
      const entity = {
        __typename: "BaseEntity",
        id,
        uuid: id,
        type: "organization",
        intialValues,
        relationValues: {},
        entityView: columnList,
      };
      return { entity, columnList: structuredClone(columnList) };
    },
    template: `
      <entity-column
        :entity="entity"
        :column-list="columnList"
        :identifiers="[entity.id]"
        entity-type="organization"
      />`,
  }),
});

export const Default: Story = story("story-columns");

export const Expanded: Story = {
  ...story("story-columns-expanded"),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>(
        '[data-cy="entity-element-window"] > div > button',
      )
      ?.click();
  },
};
