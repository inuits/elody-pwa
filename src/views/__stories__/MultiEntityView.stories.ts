import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide, reactive } from "vue";
import { routeLocationKey } from "vue-router";
import { PENDING_QUERY, registerQueryFixture, router } from "@/main";
import {
  ColumnSizes,
  InputFieldTypes,
  PanelType,
  RouteNames,
} from "@/generated-types/queries";
import MultiEntityView from "../MultiEntityView.vue";

const QUERY = "GetAssetsMediafilesAssetParts";

const field = (key: string, label: string, value: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
  value,
  inputField: { type: InputFieldTypes.Text, label },
});

const entity = (
  id: string,
  type: string,
  pill: string,
  window: string,
  fields: [string, string, string][],
) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type,
  intialValues: {
    typePillLabel: pill,
    canUpdate: true,
    canDelete: false,
    ...Object.fromEntries(fields.map(([key, , value]) => [key, value])),
  },
  relationValues: {},
  entityView: {
    column: {
      size: ColumnSizes.Hundred,
      elements: {
        window: {
          __typename: "WindowElement",
          label: window,
          info: {
            __typename: "WindowElementPanel",
            panelType: PanelType.Metadata,
            panelHeaderContent: { label: "Metadata" },
            isCollapsed: false,
            isEditable: true,
            canBeMultipleColumns: false,
            ...Object.fromEntries(
              fields.map(([key, label, value]) => [
                key,
                field(key, label, value),
              ]),
            ),
          },
        },
      },
    },
  },
});

const wem = (prefix: string) => [
  entity(`${prefix}-work`, "work_word", "W", "Work", [
    ["original_headtitle", "Head title", "Tales from the North Sea"],
    ["original_subtitle", "Subtitle", "Stories of the Flemish coast"],
    ["original_year_of_publication", "Original year of publication", "1987"],
  ]),
  entity(`${prefix}-expression`, "reading", "E", "Expression", [
    ["language", "Language", "Dutch"],
    ["target_audience", "Target audience", "Adults"],
    ["edition_statement", "Edition statement", "Second, revised edition"],
  ]),
  entity(`${prefix}-manifestation`, "manifestation_word", "M", "Manifestation", [
    ["title", "Title", "Tales from the North Sea"],
    ["publisher", "Publisher", "Lannoo"],
    ["year_of_publication", "Year of publication", "2004"],
    ["isbn", "ISBN", "978-90-209-1234-5"],
  ]),
];

const scenarios: Record<string, unknown> = {
  "story-wem-loading": PENDING_QUERY,
  "story-wem-empty": [],
};

const registerFixtures = () => {
  if (!router.hasRoute(RouteNames.SingleEntity))
    router.addRoute({
      name: RouteNames.SingleEntity,
      path: "/:type/:id",
      component: { template: "<div />" },
    });
  registerQueryFixture(QUERY, ({ id }: { id: string }) => {
    const scenario = scenarios[id];
    if (scenario === PENDING_QUERY) return PENDING_QUERY;
    return { WemOverview: scenario ?? wem(id) };
  });
};

const WemOverviewPage = defineComponent({
  components: { MultiEntityView },
  props: {
    entityId: { type: String, required: true },
    entityPageConfig: { type: Object, default: undefined },
  },
  setup(props) {
    provide("config", {
      routerConfig: [{ name: RouteNames.Home, children: [] }],
    });
    provide(
      routeLocationKey,
      reactive({
        name: "WemOverview",
        params: { id: props.entityId },
        meta: {
          queries: { getMultiEntity: QUERY },
          multiEntityLayout: true,
          entityPageConfig: props.entityPageConfig,
        },
        query: {},
        matched: [],
        path: `/wem/${props.entityId}`,
        fullPath: `/wem/${props.entityId}`,
      }) as never,
    );
  },
  template: `<multi-entity-view />`,
});

const meta: Meta = {
  title: "Views/MultiEntityView",
  component: MultiEntityView,
  parameters: {
    docs: {
      description: {
        component:
          "Several related records side by side, one column each, in the " +
          "order the route's query returns them (here a work, its " +
          "expression and a manifestation). Each column has its own header " +
          "and edits its own record.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const page = (id: string, height = 560) => ({
  components: { WemOverviewPage },
  setup: () => ({ id }),
  template: `<div style="height:${height}px"><wem-overview-page :entity-id="id" /></div>`,
});

export const Default: Story = {
  beforeEach: registerFixtures,
  render: () => page("story-wem-default"),
};

/** A field in the work column opened in place; the other columns stay as they are. */
export const Editing: Story = {
  beforeEach: registerFixtures,
  render: () => page("story-wem-editing"),
  play: async ({ canvasElement }) => {
    for (let tries = 0; tries < 50; tries++) {
      const value = canvasElement.querySelector<HTMLElement>(
        '[data-cy="field-value"][role="button"]',
      );
      if (value) return value.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
};

/** An entity type whose page config turns on the page-wide edit mode gets an Edit metadata button in its column header. */
export const PageWideEdit: Story = {
  name: "Page-wide edit mode",
  beforeEach: registerFixtures,
  render: () => ({
    components: { WemOverviewPage },
    setup: () => ({
      id: "story-wem-page-wide",
      config: { manifestation_word: { hasEditMetadataButton: true } },
    }),
    template: `<div style="height:480px"><wem-overview-page :entity-id="id" :entity-page-config="config" /></div>`,
  }),
};

const states = [
  { name: "loading", id: "story-wem-loading" },
  { name: "no results", id: "story-wem-empty" },
];

export const States: Story = {
  beforeEach: registerFixtures,
  render: () => ({
    components: { WemOverviewPage },
    setup: () => ({ states }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div v-for="state in states" :key="state.id">
          <code style="font-size:var(--text-label)">{{ state.name }}</code>
          <div style="height:200px;overflow:hidden">
            <wem-overview-page :entity-id="state.id" />
          </div>
        </div>
      </div>`,
  }),
};
