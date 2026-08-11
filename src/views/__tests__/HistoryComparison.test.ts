import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { shallowMount, flushPromises } from "@vue/test-utils";
import HistoryComparison from "../HistoryComparison.vue";

const currentEntity = ref<any>(undefined);

const mocks = vi.hoisted(() => ({
  route: { params: { id: "entity-1", type: "inscription" } },
  determineBreadcrumbsForEntity: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => mocks.route,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/history/EntityHistoryColumn.vue", () => ({
  default: { name: "EntityHistoryColumn", template: "<div />" },
}));

vi.mock("@/components/base/AdvancedDropdown.vue", () => ({
  default: { name: "AdvancedDropdown", template: "<div />" },
}));

vi.mock("@/components/SpinnerLoader.vue", () => ({
  default: { name: "SpinnerLoader", template: "<div />" },
}));

vi.mock("@/composables/useHistoryComparisonData", () => ({
  LIVE_VERSION_ID: "__live__",
  useHistoryComparisonData: () => ({
    currentEntity,
    versionOptions: ref([]),
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
