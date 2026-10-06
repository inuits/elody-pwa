import { computed, defineComponent, h, inject, isRef } from "vue";
import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import EntityHistoryColumn from "../EntityHistoryColumn.vue";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";

vi.mock("@/components/history/EntityHistoryElement.vue", () => ({
  default: { name: "EntityHistoryElement", template: "<div />" },
}));

const receivedElements: Record<string, any>[] = [];
const InjectProbe = defineComponent({
  name: "EntityHistoryElement",
  props: { elements: { type: Object, default: () => ({}) } },
  setup(props) {
    const parentEntity = inject<any>("ParentEntityProvider", undefined);
    const entityId = computed(() => parentEntity?.value?.id ?? "");
    receivedElements.push(props.elements);
    return () => h("div", { "data-testid": "probe" }, entityId.value);
  },
});

const getDefaultProps = () => ({
  entity: {
    id: "entity-1",
    uuid: "uuid-1",
    entityView: { column1: { elements: {} } },
    intialValues: {},
    relationValues: {},
  },
  wysiwygDiffs: [],
  relationDiffs: [],
});

const getWrapper = (props = getDefaultProps()) =>
  mount(EntityHistoryColumn, {
    props,
    global: {
      stubs: { EntityHistoryElement: InjectProbe, WysiwygDiffFlag: true },
    },
  });

describe("EntityHistoryColumn", () => {
  beforeEach(() => {
    receivedElements.length = 0;
  });

  it("provides ParentEntityProvider with the entity it was given", () => {
    const wrapper = getWrapper();
    expect(wrapper.find('[data-testid="probe"]').text()).toBe("entity-1");
  });

  it("updates the provided entity reactively when the entity prop changes", async () => {
    const wrapper = getWrapper();
    await wrapper.setProps({
      ...getDefaultProps(),
      entity: {
        ...getDefaultProps().entity,
        id: "entity-2",
      },
    });
    expect(wrapper.find('[data-testid="probe"]').text()).toBe("entity-2");
  });

  it("primes the entity's edit state before render, so the first real read of it downstream is already unwrapped", () => {
    getWrapper({
      ...getDefaultProps(),
      entity: { ...getDefaultProps().entity, id: "prime-test-entity" },
    });

    expect(isRef(useEditMode("prime-test-entity").isEdit)).toBe(false);
  });

  describe("id field omission", () => {
    const entityWithIdField = () => ({
      id: "entity-1",
      uuid: "uuid-1",
      entityView: {
        column: {
          elements: {
            windowElement: {
              info: {
                id: {
                  __typename: "PanelMetaData",
                  key: "id",
                  label: "metadata.labels.id",
                },
                significance: {
                  __typename: "PanelMetaData",
                  key: "significance",
                  label: "metadata.labels.significance",
                },
              },
            },
          },
        },
      },
      intialValues: {},
      relationValues: {},
    });

    it("omits the id PanelMetaData field from what is passed down to EntityHistoryElement", () => {
      getWrapper({ ...getDefaultProps(), entity: entityWithIdField() });

      const info = receivedElements[0]?.windowElement?.info;
      expect(info?.id).toBeUndefined();
    });

    it("keeps every other field intact", () => {
      getWrapper({ ...getDefaultProps(), entity: entityWithIdField() });

      const info = receivedElements[0]?.windowElement?.info;
      expect(info?.significance).toEqual({
        __typename: "PanelMetaData",
        key: "significance",
        label: "metadata.labels.significance",
      });
    });
  });

  describe("column ordering", () => {
    it("renders one EntityHistoryElement per column, in entityView's own column order", () => {
      getWrapper({
        ...getDefaultProps(),
        entity: {
          id: "entity-1",
          uuid: "uuid-1",
          entityView: {
            column: { elements: { marker: "first" } },
            column2: { elements: { marker: "second" } },
          },
          intialValues: {},
          relationValues: {},
        },
      });

      expect(receivedElements).toHaveLength(2);
      expect(receivedElements[0].marker).toBe("first");
      expect(receivedElements[1].marker).toBe("second");
    });
  });

  describe("elements marked hideInHistory", () => {
    it("leaves out elements configured with hideInHistory, keeping every other element", () => {
      getWrapper({
        ...getDefaultProps(),
        entity: {
          ...getDefaultProps().entity,
          entityView: {
            column: {
              elements: {
                history: {
                  __typename: "EntityListElement",
                  label: "panel-labels.history",
                  relationType: null,
                  hideInHistory: true,
                },
                customList: {
                  __typename: "EntityListElement",
                  label: "element-labels.custom-list",
                  relationType: null,
                  hideInHistory: null,
                },
              },
            },
          },
        },
      });

      expect(receivedElements[0].history).toBeUndefined();
      expect(receivedElements[0].customList).toEqual({
        __typename: "EntityListElement",
        label: "element-labels.custom-list",
        relationType: null,
        hideInHistory: null,
      });
    });

    it("leaves out window elements configured with hideInHistory, keeping other window elements", () => {
      getWrapper({
        ...getDefaultProps(),
        entity: {
          ...getDefaultProps().entity,
          entityView: {
            column: {
              elements: {
                audit: {
                  __typename: "WindowElement",
                  label: "panel-labels.audit-panel",
                  hideInHistory: true,
                },
                info: {
                  __typename: "WindowElement",
                  label: "panel-labels.info",
                },
              },
            },
          },
        },
      });

      expect(receivedElements[0].audit).toBeUndefined();
      expect(receivedElements[0].info).toEqual({
        __typename: "WindowElement",
        label: "panel-labels.info",
      });
    });
  });

  describe("form values", () => {
    it("follows the entity's values when they change after mounting, so a diff that arrives later still shows", async () => {
      const entity = {
        ...getDefaultProps().entity,
        id: "late-diff-entity",
        intialValues: { name: "Current name" },
      };
      const wrapper = getWrapper({ ...getDefaultProps(), entity });

      const diffed = { formatter: "pill|added", label: "Current name" };
      await wrapper.setProps({
        ...getDefaultProps(),
        entity: { ...entity, intialValues: { name: diffed } },
      });

      expect(
        useFormHelper().getForm("late-diff-entity")?.values.intialValues.name,
      ).toEqual(diffed);
    });
  });
});
