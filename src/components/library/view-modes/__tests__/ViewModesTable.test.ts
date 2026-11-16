import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ViewModesTable from "../ViewModesTable.vue";
import { type Entity } from "@/generated-types/queries";

const appConfig = vi.hoisted(() => ({
  features: {} as Record<string, unknown>,
}));
vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: (key: string, ...rest: unknown[]) =>
      key === "config"
        ? appConfig
        : (actual.inject as (...args: unknown[]) => unknown)(key, ...rest),
  };
});
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: vi.fn(), changeCloseConfirmation: vi.fn() }),
}));

vi.mock("@/composables/useEntityPageConfig", async () => {
  const { ref } = await import("vue");
  return { useEntityPageConfig: () => ({ seenTracking: ref(undefined) }) };
});

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ findRelation: () => "no-relation-found" }),
}));

vi.mock(
  "@/components/library/view-modes/composables/useEntityListHelpers",
  () => ({
    useEntityListHelpers: () => ({
      getLinkSettings: () => ({ tag: "div", path: undefined }),
      isEntityDisabled: () => false,
      entityWrapperHandler: vi.fn(),
      getButtons: () => undefined,
    }),
  }),
);

vi.mock("@/helpers", () => ({
  formatTeaserMetadata: (teaserMetadata: any, intialValues: any) =>
    Object.keys(teaserMetadata ?? {})
      .filter((key) => key !== "__typename")
      .map((key) => ({
        ...teaserMetadata[key],
        key,
        value: intialValues?.[key],
      })),
  getMappedSlug: (entity: any) => entity.type,
}));

const makeEntity = (id: string): Entity =>
  ({
    id,
    uuid: id,
    type: "user",
    teaserMetadata: { first_name: { label: "First name", key: "first_name" } },
    intialValues: { id, first_name: id },
    relationValues: {},
  }) as unknown as Entity;

const checkboxStub = {
  name: "BaseInputCheckbox",
  props: ["modelValue", "ariaLabel"],
  emits: ["update:modelValue"],
  template: "<input type='checkbox' data-cy='select-page-stub' />",
};

const mountTable = (props: Record<string, unknown> = {}) =>
  mount(ViewModesTable, {
    props: {
      entities: [makeEntity("u1"), makeEntity("u2")],
      entitiesLoading: false,
      bulkOperationsContext: undefined,
      listItemRouteName: "SingleEntity",
      entityType: "user",
      configPerViewMode: {},
      ...props,
    } as any,
    global: {
      stubs: {
        TableViewRow: true,
        PreviewWrapper: true,
        PreviewHost: true,
        BaseButtonNew: true,
        BaseInputCheckbox: checkboxStub,
      },
    },
  });

const selectPage = (wrapper: ReturnType<typeof mountTable>) =>
  wrapper
    .find('[data-cy="view-modes-table-header-leading"]')
    .findComponent({ name: "BaseInputCheckbox" });

describe("ViewModesTable header", () => {
  it("selects the page from the leading column", async () => {
    const wrapper = mountTable({ pageIsSelected: true });
    expect(selectPage(wrapper).exists()).toBe(true);
    expect(selectPage(wrapper).props("modelValue")).toBe(true);
    expect(selectPage(wrapper).props("ariaLabel")).toBe(
      "bulk-operations.select-page",
    );
    selectPage(wrapper).vm.$emit("update:modelValue", false);
    expect(wrapper.emitted("togglePageSelection")).toEqual([[false]]);
  });

  it("has no select-page box when selection is off", () => {
    const wrapper = mountTable({ enableSelection: false });
    expect(
      wrapper.findComponent({ name: "BaseInputCheckbox" }).exists(),
    ).toBe(false);
  });
});

describe("ViewModesTable pinned columns", () => {
  const work = (id: string): Entity =>
    ({
      id,
      uuid: id,
      type: "work",
      teaserMetadata: {
        type: { label: "Type", key: "type" },
        title: { label: "Title", key: "title" },
        author: { label: "Author", key: "author" },
      },
      intialValues: {
        id,
        type: { formatter: "pill" },
        title: "Slaap, baby, slaap",
        author: "Schittekatte",
      },
      relationValues: {},
    }) as unknown as Entity;

  it("pins the leading badges and the title, in the header and the rows", () => {
    const wrapper = mountTable({ entities: [work("w1"), work("w2")] });
    const header = wrapper.findAll(
      '[data-cy="view-modes-table-header"] .col-primary, [data-cy="view-modes-table-header"] .col-secondary',
    );
    expect(header.map((column) => column.classes("col-pinned"))).toEqual([
      true,
      true,
      false,
    ]);
    expect(
      wrapper.findComponent({ name: "TableViewRow" }).props("pinnedCount"),
    ).toBe(2);
  });

  // Header and rows share one grid template, so their columns line up
  // without measuring; a narrow table keeps the minimums and scrolls.
  it("gives the header and rows one column template", () => {
    const wrapper = mountTable({ entities: [work("w1")] });
    expect(
      wrapper.find('[data-cy="view-modes-table"]').attributes("style"),
    ).toContain(
      "--table-columns: var(--table-col-badge) minmax(var(--table-col-title), 1fr) minmax(var(--table-col), 1fr)",
    );
  });

  // A pill column after the title (podiumnet's organisations) can hold
  // several pills, so it shares the width like any other column.
  it("only gives the leading badges a fixed width", () => {
    const contact = {
      ...work("c1"),
      teaserMetadata: {
        email: { label: "E-mail", key: "email" },
        organisation: { label: "Organisation", key: "organisation" },
      },
      intialValues: {
        id: "c1",
        email: "jos@joosens.be",
        organisation: { formatter: "pill" },
      },
    } as unknown as Entity;
    const wrapper = mountTable({ entities: [contact] });
    expect(
      wrapper.find('[data-cy="view-modes-table"]').attributes("style"),
    ).toContain(
      "--table-columns: minmax(var(--table-col-title), 1fr) minmax(var(--table-col), 1fr)",
    );
  });

  it("pins nothing when the client turns sticky columns off", () => {
    appConfig.features = { hasStickyTableColumns: false };
    const wrapper = mountTable({ entities: [work("w1")] });
    appConfig.features = {};
    expect(
      wrapper.findAll('[data-cy="view-modes-table-header"] .col-pinned'),
    ).toHaveLength(0);
    expect(
      wrapper.findComponent({ name: "TableViewRow" }).props("pinnedCount"),
    ).toBe(0);
    expect(
      wrapper.find('[data-cy="view-modes-table"]').attributes("style"),
    ).toContain("--table-columns: var(--table-col-badge) minmax(");
  });
});
