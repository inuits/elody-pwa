import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide, reactive } from "vue";
import { routeLocationKey } from "vue-router";
import { PENDING_QUERY, registerQueryFixture } from "@/main";
import { RouteNames } from "@/generated-types/queries";
import HistoryComparison from "../HistoryComparison.vue";

const BOOK = "story-history-book";

const elements = {
  info: {
    __typename: "WindowElement",
    label: "Metadata",
    panel: {
      __typename: "WindowElementPanel",
      label: "Info",
      title: { __typename: "PanelMetaData", key: "title", label: "Title" },
      publisher: {
        __typename: "PanelMetaData",
        key: "publisher",
        label: "Publisher",
      },
      year: { __typename: "PanelMetaData", key: "year", label: "Year" },
      makers: {
        __typename: "EntityListElement",
        label: "Makers",
        relationType: "hasMaker",
        entityTypes: ["person"],
      },
      description: {
        __typename: "WysiwygElement",
        label: "Description",
        metadataKey: "description",
      },
    },
  },
};

const version = (
  id: string,
  intialValues: Record<string, unknown>,
  makers: string[],
) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "book",
  intialValues,
  relationValues: { hasMaker: makers.map((key) => ({ key })) },
  entityView: { column: { elements: structuredClone(elements) } },
});

const current = version(
  BOOK,
  {
    title: "Tales from the North Sea",
    publisher: "Standaard Uitgeverij",
    year: "1987",
    description:
      "<p>A collection of fishermen's tales, <strong>illustrated</strong>.</p>",
  },
  ["m1", "m2"],
);

const previous = version(
  BOOK,
  {
    title: "Tales from the North Sea",
    publisher: "Lannoo",
    year: "1987",
    description: "<p>A collection of fishermen's tales.</p>",
  },
  ["m1", "m3"],
);

const versions = [
  { versionId: "v1", timestamp: "2026-03-02T09:15:00Z", editedBy: "Marie Vermeulen" },
  { versionId: "v2", timestamp: "2026-05-11T14:40:00Z", editedBy: "Jan Persoon" },
  { versionId: "v3", timestamp: "2026-09-24T10:05:00Z", editedBy: "Lotte De Smet" },
].map((row) => ({
  __typename: "EntityHistoryVersion",
  documentVersion: 1,
  ...row,
}));

const makers: Record<string, string> = {
  m1: "Marie Vermeulen",
  m2: "Jan Persoon",
  m3: "Lotte De Smet",
};

type Scenario = {
  versions?: unknown;
  detail?: unknown;
};

const scenarios: Record<string, Scenario> = {};

const fail = () => {
  throw new Error("story failure");
};

const scenarioFor = (id: string): Scenario => scenarios[id] ?? {};

const resolve = (value: unknown, data: () => unknown) => {
  if (value === PENDING_QUERY) return PENDING_QUERY;
  if (value === fail) fail();
  return data();
};

const registerFixtures = () => {
  registerQueryFixture("getEntityById", ({ id }: { id: string }) => ({
    Entity: { ...current, id, uuid: id },
  }));
  registerQueryFixture(
    "GetEntityHistoryVersions",
    ({ id }: { id: string }) => {
      const scenario = scenarioFor(id);
      return resolve(scenario.versions, () => ({
        EntityHistoryVersions: scenario.versions ?? versions,
      }));
    },
  );
  registerQueryFixture(
    "GetEntityHistoryVersionDetail",
    ({ id }: { id: string }) =>
      resolve(scenarioFor(id).detail, () => ({
        EntityHistoryVersionDetail: { ...previous, id, uuid: id },
      })),
  );
  registerQueryFixture(
    "GetRelationLabelsForIds",
    ({ ids }: { ids: string[] }) => ({
      RelationLabelsForIds: ids.map((key) => ({
        __typename: "KeyValue",
        key,
        value: makers[key] ?? key,
      })),
    }),
  );
};

const HistoryPage = defineComponent({
  components: { HistoryComparison },
  props: { entityId: { type: String, required: true } },
  setup(props) {
    provide("config", {
      routerConfig: [{ name: RouteNames.Home, children: [] }],
    });
    provide(
      routeLocationKey,
      reactive({
        params: { id: props.entityId, type: "book" },
        meta: {},
        query: {},
        path: `/book/${props.entityId}/history`,
        fullPath: `/book/${props.entityId}/history`,
      }) as never,
    );
  },
  template: `<history-comparison />`,
});

const meta: Meta = {
  title: "History/HistoryComparison",
  component: HistoryComparison,
  parameters: {
    docs: {
      description: {
        component:
          "The history page: two versions of a record side by side, each " +
          "under a header with a version dropdown and who edited it when. " +
          "By default the current version is on the left and the version " +
          "before it on the right.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  beforeEach: registerFixtures,
  render: () => ({
    components: { HistoryPage },
    setup: () => ({ id: BOOK }),
    template: `<div style="height:560px"><history-page :entity-id="id" /></div>`,
  }),
};

const states = [
  { name: "loading", id: "story-history-loading", detail: PENDING_QUERY },
  { name: "no history", id: "story-history-none", versions: [] },
  {
    name: "no earlier version",
    id: "story-history-single",
    versions: versions.slice(0, 1),
  },
  { name: "version failed", id: "story-history-version-error", detail: fail },
  { name: "history failed", id: "story-history-error", versions: fail },
];

export const States: Story = {
  beforeEach: () => {
    states.forEach(({ id, versions, detail }) => {
      scenarios[id] = { versions, detail };
    });
    registerFixtures();
  },
  render: () => ({
    components: { HistoryPage },
    setup: () => ({ states }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div v-for="state in states" :key="state.id">
          <code style="font-size:var(--text-label)">{{ state.name }}</code>
          <div style="height:180px;overflow:hidden">
            <history-page :entity-id="state.id" />
          </div>
        </div>
      </div>`,
  }),
};
