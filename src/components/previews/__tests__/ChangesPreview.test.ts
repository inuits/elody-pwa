import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import ChangesPreview from "@/components/previews/ChangesPreview.vue";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  query: vi.fn(),
}));

vi.mock("@vue/apollo-composable", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/main", () => ({ apolloClient: { query: mocks.query } }));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: vi.fn().mockResolvedValue({}) }),
}));
vi.mock("@/generated-types/queries", () => ({ GetEntityByIdDocument: {} }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/EntityColumn.vue", () => ({
  default: {
    name: "EntityColumn",
    props: {
      entity: null,
      columnList: null,
      identifiers: null,
      entityType: null,
      compact: Boolean,
    },
    template: "<div />",
  },
}));

const PREVIEW_ELEMENT = {
  column: {
    elements: {
      windowElement: {
        __typename: "WindowElement",
        label: "panel-labels.notification-new-values",
        fields: {
          __typename: "WindowElementPanel",
          title: { __typename: "PanelMetaData", key: "title" },
          duration: { __typename: "PanelMetaData", key: "duration" },
        },
      },
      entityListElement: {
        __typename: "EntityListElement",
        relationType: "ref_mediafiles",
      },
    },
  },
};

const getNotification = (overrides: Record<string, any> = {}) => ({
  id: "NO-1",
  type: "notification",
  intialValues: { updated_keys: ["title"] },
  relationValues: {
    ref_production: [{ key: "PR-1" }],
    ref_mediafiles: [{ key: "MF-1" }],
  },
  ...overrides,
});

const mountPreview = (entity = getNotification()) =>
  shallowMount(ChangesPreview, {
    props: {
      changesPreview: {
        query: "GetChangesPreviewForNotification",
        relationType: "ref_production",
        entityType: "production",
        changedKeysKey: "updated_keys",
      } as any,
      entity: entity as any,
    },
    global: {
      stubs: { ParentEntityScope: { template: "<div><slot /></div>" } },
    },
  });

const columns = (wrapper: ReturnType<typeof mountPreview>) =>
  wrapper.findAllComponents({ name: "EntityColumn" });

describe("ChangesPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockResolvedValue({
      data: { PreviewElement: PREVIEW_ELEMENT },
    });
    mocks.useQuery.mockReturnValue({
      result: ref({ Entity: { id: "PR-1", type: "production" } }),
    });
  });

  it("fetches the related entity from the configured relation", () => {
    mountPreview();
    const [, variables] = mocks.useQuery.mock.calls[0];

    expect(variables()).toEqual({ id: "PR-1", type: "production" });
  });

  it("does not fetch when the previewed entity has no such relation", () => {
    mountPreview(getNotification({ relationValues: {} }));
    const [, , options] = mocks.useQuery.mock.calls[0];

    expect(options().enabled).toBe(false);
  });

  it("renders the related entity under a suffixed id with only the changed fields", async () => {
    const wrapper = mountPreview();
    await flushPromises();
    const fieldsColumn = columns(wrapper)[0];
    const panel =
      fieldsColumn.props("columnList").column.elements.windowElement.fields;

    expect(fieldsColumn.props("entity").id).toBe("PR-1_changes");
    expect(panel.title).toBeDefined();
    expect(panel.duration).toBeUndefined();
  });

  it("renders related lists with the previewed entity", async () => {
    const wrapper = mountPreview();
    await flushPromises();
    const listsColumn = columns(wrapper)[1];

    expect(listsColumn.props("entity").id).toBe("NO-1");
    expect(listsColumn.props("compact")).toBe(true);
  });

  it("hides related lists the previewed entity has no relations for", async () => {
    const wrapper = mountPreview(
      getNotification({
        relationValues: { ref_production: [{ key: "PR-1" }] },
      }),
    );
    await flushPromises();

    expect(columns(wrapper)).toHaveLength(1);
  });

  it("shows the changed fields as flat rows under a block heading, not as a nested card", async () => {
    const wrapper = mountPreview();
    await flushPromises();
    const heading = wrapper.find("[data-cy='changes-preview-title']");

    expect(heading.element.tagName).toBe("H4");
    expect(heading.text()).toBe("panel-labels.notification-new-values");
    expect(heading.classes()).toEqual(
      expect.arrayContaining(["text-table", "font-bold", "text-text-body"]),
    );
    expect(columns(wrapper)[0].props("compact")).toBe(true);
  });
});
