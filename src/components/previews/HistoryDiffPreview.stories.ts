import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import HistoryDiffPreview from "./HistoryDiffPreview.vue";
import {
  RouteNames,
  type ColumnList,
  type Entity,
  type Entitytyping,
} from "@/generated-types/queries";

// Side-by-side version diff: previous version left, selected version right,
// changed rows marked. Manifest id `components-historydiffpreview--two-column`.
const panelMetaData = (key: string, label: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
  showOnlyInEditMode: false,
});

const columnList = {
  __typename: "ColumnList",
  column: {
    __typename: "Column",
    size: "hundred",
    elements: {
      __typename: "WindowElement",
      label: "Beschrijving",
      metadataPanel: {
        __typename: "WindowElementPanel",
        panelType: "metadata",
        isCollapsed: false,
        isEditable: false,
        canBeMultipleColumns: false,
        panelHeaderContent: {
          __typename: "PanelHeaderContent",
          label: "Beschrijving",
        },
        titleField: panelMetaData("title", "Titel"),
        annotationField: panelMetaData("annotation", "Annotatie"),
        yearField: panelMetaData("publication_year", "Publicatiejaar"),
      },
    },
  },
} as unknown as ColumnList;

const previousVersion = {
  id: "version-1",
  uuid: "version-1",
  type: "manifestation",
  intialValues: {
    __typename: "IntialValues",
    title: "De ontdekking van de hemel",
    annotation: "Eerste druk.",
    publication_year: "1992",
  },
} as unknown as Entity;

const selectedVersion = {
  id: "version-2",
  uuid: "version-2",
  type: "manifestation",
  intialValues: {
    __typename: "IntialValues",
    title: "De ontdekking van de hemel",
    annotation: "Paperback-heruitgave met nieuw voorwoord.",
    publication_year: "2010",
  },
} as unknown as Entity;

const meta: Meta<typeof HistoryDiffPreview> = {
  title: "Components/HistoryDiffPreview",
  component: HistoryDiffPreview,
  tags: ["autodocs"],
  decorators: [
    () => ({
      // EntityColumn → EntityForm reads the home routes from the injected
      // config at setup time.
      setup() {
        provide("config", {
          customization: {},
          features: {},
          routerConfig: [{ name: RouteNames.Home, children: [] }],
        });
      },
      template: '<div class="p-4"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof HistoryDiffPreview>;

export const TwoColumn: Story = {
  args: {
    entity: selectedVersion,
    entities: [previousVersion, selectedVersion],
    entityId: "version-2",
    parentEntityId: "entity-1",
    entityType: "manifestation" as Entitytyping,
    columnList,
  },
};
