import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { shallowMount, flushPromises } from "@vue/test-utils";
import HistoryComparison from "../HistoryComparison.vue";

const currentEntity = ref<any>(undefined);
const versionOptions = ref<any[]>([]);
const leftVersionMeta = ref<any>(null);
const rightVersionMeta = ref<any>(null);
const hasNoHistory = ref(false);
const hasNoPreviousVersions = ref(false);
const currentVersionNumber = ref<number | null>(null);
const versionsError = ref<any>(null);
const leftVersionError = ref(false);
const rightVersionError = ref(false);

const mocks = vi.hoisted(() => ({
  route: {
    params: { id: "entity-1", type: "inscription" },
    meta: {} as Record<string, any>,
  },
  determineBreadcrumbsFromRouteConfig: vi.fn(),
  determineBreadcrumbsForEntity: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => mocks.route,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key} ${JSON.stringify(params)}` : key,
  }),
}));

vi.mock("@/components/history/EntityHistoryColumn.vue", () => ({
  default: { name: "EntityHistoryColumn", template: "<div />" },
}));

vi.mock("@/components/base/AdvancedDropdown.vue", () => ({
  default: {
    name: "AdvancedDropdown",
    props: ["options", "modelValue"],
    template: "<div />",
  },
}));

vi.mock("@/components/SpinnerLoader.vue", () => ({
  default: { name: "SpinnerLoader", template: "<div />" },
}));

vi.mock("@/composables/useHistoryComparisonData", () => ({
  LIVE_VERSION_ID: "__live__",
  useHistoryComparisonData: () => ({
    currentEntity,
    versionOptions,
    leftVersionMeta,
    rightVersionMeta,
    hasNoHistory,
    hasNoPreviousVersions,
    currentVersionNumber,
    versionsError,
    leftVersionError,
    rightVersionError,
    leftVersionId: ref(null),
    rightVersionId: ref(null),
    leftLoading: ref(false),
    rightLoading: ref(false),
    leftVersionEntity: ref(null),
    rightVersionEntity: ref(null),
    leftWysiwygDiffs: ref([]),
    rightWysiwygDiffs: ref([]),
    leftRelationDiffs: ref([]),
    rightRelationDiffs: ref([]),
  }),
}));

vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    determineBreadcrumbsFromRouteConfig:
      mocks.determineBreadcrumbsFromRouteConfig,
    determineBreadcrumbsForEntity: mocks.determineBreadcrumbsForEntity,
  }),
}));

const getWrapper = () =>
  shallowMount(HistoryComparison, {
    global: {
      provide: { config: {} },
      mocks: { $t: (key: string) => key },
    },
  });

describe("HistoryComparison", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route.meta = {};
    currentEntity.value = undefined;
    versionOptions.value = [];
    leftVersionMeta.value = null;
    rightVersionMeta.value = null;
    hasNoHistory.value = false;
    hasNoPreviousVersions.value = false;
    currentVersionNumber.value = null;
    versionsError.value = null;
    leftVersionError.value = false;
    rightVersionError.value = false;
  });

  const messageKeys = (wrapper: ReturnType<typeof getWrapper>) =>
    wrapper
      .findAll('[data-test="history-message"]')
      .map((message) => message.text());

  it("tells the user when the entity has no history yet", async () => {
    hasNoHistory.value = true;
    const wrapper = getWrapper();
    await flushPromises();

    expect(messageKeys(wrapper)).toEqual(["history.no-history"]);
  });

  it("tells the user when the history could not be loaded", async () => {
    versionsError.value = new Error("down");
    const wrapper = getWrapper();
    await flushPromises();

    expect(messageKeys(wrapper)).toEqual(["history.versions-load-error"]);
  });

  it("tells the user on the right side when that version could not be loaded", async () => {
    rightVersionError.value = true;
    const wrapper = getWrapper();
    await flushPromises();

    expect(messageKeys(wrapper)).toEqual(["history.version-load-error"]);
  });

  it("tells the user on the right side when there is no earlier version to compare with", async () => {
    hasNoPreviousVersions.value = true;
    const wrapper = getWrapper();
    await flushPromises();

    expect(messageKeys(wrapper)).toEqual(["history.no-previous-versions"]);
  });

  it("shows no message when the history loaded normally", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    expect(messageKeys(wrapper)).toEqual([]);
  });

  it("shows who made the version on each side and when", async () => {
    leftVersionMeta.value = { editedBy: "bob@example.com", date: "2/1/2026" };
    rightVersionMeta.value = { editedBy: "alice@example.com", date: "1/1/2026" };
    const wrapper = getWrapper();
    await flushPromises();

    const lines = wrapper.findAll('[data-test="history-version-author"]');
    expect(lines).toHaveLength(2);
    expect(lines[0].text()).toContain("bob@example.com");
    expect(lines[0].text()).toContain("2/1/2026");
    expect(lines[1].text()).toContain("alice@example.com");
  });

  it("shows no author line for a side without a known author", async () => {
    rightVersionMeta.value = { editedBy: "alice@example.com", date: "1/1/2026" };
    const wrapper = getWrapper();
    await flushPromises();

    expect(wrapper.findAll('[data-test="history-version-author"]')).toHaveLength(1);
  });

  it("names the current version together with its version number", async () => {
    currentVersionNumber.value = 3;
    const wrapper = getWrapper();
    await flushPromises();

    const leftDropdown = wrapper.findAllComponents({ name: "AdvancedDropdown" })[0];
    expect(leftDropdown.props("options")[0].label).toBe(
      'history.current-version-number {"number":3}',
    );
  });

  it("names the current version without a number when there is no history", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    const leftDropdown = wrapper.findAllComponents({ name: "AdvancedDropdown" })[0];
    expect(leftDropdown.props("options")[0].label).toBe("history.current-version");
  });

  it("names the author in every version option", async () => {
    versionOptions.value = [
      { id: "v1", label: "Version 1 (1/1/2026)", editedBy: "alice@example.com" },
    ];
    const wrapper = getWrapper();
    await flushPromises();

    const rightDropdown = wrapper.findAllComponents({ name: "AdvancedDropdown" })[1];
    expect(rightDropdown.props("options")[0].label).toContain("alice@example.com");
  });

  it("builds the breadcrumbs from the route's configuration once the entity loads", async () => {
    const breadcrumbs = [
      { current: true, title: "history.title" },
      { entity: true, routeName: "SingleEntity" },
    ];
    mocks.route.meta = { breadcrumbs };
    getWrapper();
    await flushPromises();
    expect(mocks.determineBreadcrumbsFromRouteConfig).not.toHaveBeenCalled();

    const entity = { id: "entity-1", type: "inscription" };
    currentEntity.value = entity;
    await flushPromises();

    expect(mocks.determineBreadcrumbsFromRouteConfig).toHaveBeenCalledWith(
      breadcrumbs,
      entity,
    );
    expect(mocks.determineBreadcrumbsForEntity).not.toHaveBeenCalled();
  });

  it("falls back to the entity's own breadcrumbs when the route configures none", async () => {
    mocks.route.meta = {};
    getWrapper();
    const entity = { id: "entity-1", type: "inscription" };
    currentEntity.value = entity;
    await flushPromises();

    expect(mocks.determineBreadcrumbsForEntity).toHaveBeenCalledWith(entity);
    expect(mocks.determineBreadcrumbsFromRouteConfig).not.toHaveBeenCalled();
  });

  it("does not determine breadcrumbs while the live entity is still loading", async () => {
    getWrapper();
    await flushPromises();

    expect(mocks.determineBreadcrumbsFromRouteConfig).not.toHaveBeenCalled();
  });
});
