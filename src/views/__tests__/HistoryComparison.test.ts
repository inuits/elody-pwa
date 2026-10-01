import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { shallowMount, flushPromises } from "@vue/test-utils";
import HistoryComparison from "../HistoryComparison.vue";

const currentEntity = ref<any>(undefined);
const versionOptions = ref<any[]>([]);
const leftVersionMeta = ref<any>(null);
const rightVersionMeta = ref<any>(null);

const mocks = vi.hoisted(() => ({
  route: { params: { id: "entity-1", type: "inscription" } },
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
    currentEntity.value = undefined;
    versionOptions.value = [];
    leftVersionMeta.value = null;
    rightVersionMeta.value = null;
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

  it("names the author in every version option", async () => {
    versionOptions.value = [
      { id: "v1", label: "Version 1 (1/1/2026)", editedBy: "alice@example.com" },
    ];
    const wrapper = getWrapper();
    await flushPromises();

    const rightDropdown = wrapper.findAllComponents({ name: "AdvancedDropdown" })[1];
    expect(rightDropdown.props("options")[0].label).toContain("alice@example.com");
  });

  it("determines breadcrumbs once the live entity loads", async () => {
    getWrapper();
    await flushPromises();
    expect(mocks.determineBreadcrumbsForEntity).not.toHaveBeenCalled();

    const entity = { id: "entity-1", type: "inscription" };
    currentEntity.value = entity;
    await flushPromises();

    expect(mocks.determineBreadcrumbsForEntity).toHaveBeenCalledWith(entity);
  });

  it("does not determine breadcrumbs while the live entity is still loading", async () => {
    getWrapper();
    await flushPromises();

    expect(mocks.determineBreadcrumbsForEntity).not.toHaveBeenCalled();
  });
});
