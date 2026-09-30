import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryWindow from "../EntityHistoryWindow.vue";

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, showErrors: true }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("@/main", () => ({ auth: { isAuthenticated: { value: true } } }));

const mountWindow = (
  element: Record<string, any>,
  extraProps: Record<string, any> = {},
) =>
  mount(EntityHistoryWindow, {
    props: {
      element,
      identifiers: [],
      formId: "1",
      wysiwygDiffs: [],
      relationDiffs: [],
      ...extraProps,
    } as any,
    global: {
      stubs: {
        EntityHistoryWindowPanel: {
          name: "EntityHistoryWindowPanel",
          props: ["panel"],
          template: "<div />",
        },
      },
    },
  });

const renderedPanelLabels = (wrapper: ReturnType<typeof mountWindow>) =>
  wrapper
    .findAllComponents({ name: "EntityHistoryWindowPanel" })
    .map((panel) => panel.props("panel").label);

describe("EntityHistoryWindow panels", () => {
  it("renders every panel it was handed without checking permissions itself", async () => {
    const wrapper = mountWindow({
      label: "Window",
      item1: { __typename: "WindowElementPanel", label: "Public", can: null },
      item2: {
        __typename: "WindowElementPanel",
        label: "Admin Only",
        can: "role:admin",
      },
      item3: { __typename: "NotAPanel", label: "Ignore Me" },
    });
    await flushPromises();

    expect(renderedPanelLabels(wrapper)).toEqual(["Public", "Admin Only"]);
  });

  it("renders nothing for a panel the graphql layer left out", async () => {
    const wrapper = mountWindow({
      label: "Window",
      info: { __typename: "WindowElementPanel", label: "Info" },
      settings: null,
    });
    await flushPromises();

    expect(renderedPanelLabels(wrapper)).toEqual(["Info"]);
  });

  it("still hides a panel whose display condition does not match", async () => {
    const wrapper = mountWindow(
      {
        label: "Window",
        always: { __typename: "WindowElementPanel", label: "Always" },
        conditional: {
          __typename: "WindowElementPanel",
          label: "Conditional",
          displayCondition: { key: "status", value: "published" },
        },
      },
      { entityMetadata: { status: "draft" } },
    );
    await flushPromises();

    expect(renderedPanelLabels(wrapper)).toEqual(["Always"]);
  });
});
