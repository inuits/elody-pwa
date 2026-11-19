import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { ActionOnClick, type Entity } from "@/generated-types/queries";
import { useEntityListHelpers } from "../useEntityListHelpers";

vi.mock("vue", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue")>()),
  inject: vi.fn((_key: string, fallback?: unknown) => fallback),
}));

const scoped = vi.hoisted(() => ({ isScoped: false, navigate: vi.fn() }));

vi.mock("@/composables/useScopedEntityNavigation", () => ({
  useScopedEntityNavigation: () => scoped,
}));

vi.mock("@/helpers", () => ({
  getEntityPageRoute: vi.fn((entity: any, name: string) => ({
    name,
    params: { id: entity.id },
  })),
  updateEntityMediafileOnlyForMediafiles: vi.fn(),
}));

vi.mock("@/composables/useLibraryBar", () => ({
  useLibraryBar: () => ({ queryVariables: ref({ searchValue: {} }) }),
}));

vi.mock("@/EventBus", () => ({ default: { on: vi.fn() } }));

const download = { __typename: "ActionButton", label: "download" };
const contextMenu = { __typename: "ContextMenuActions", doLinkAction: {} };

const makeEntity = (teaserMetadata: object): Entity =>
  ({ id: "MF-1", teaserMetadata }) as unknown as Entity;

const getButtonsFor = (
  entity: Entity,
  parentEntityIdentifiers: string[] = [],
) =>
  useEntityListHelpers(
    { parentEntityIdentifiers },
    ref([]),
    ref(false),
    () => {},
  ).getButtons(entity);

describe("useEntityListHelpers.getButtons", () => {
  it("keeps every button inside a parent entity", () => {
    const entity = makeEntity({ buttons: { download, contextMenu } });

    expect(getButtonsFor(entity, ["PROD-1"])).toEqual({
      download,
      contextMenu,
    });
  });

  it("drops only the context menu outside a parent entity", () => {
    const entity = makeEntity({ buttons: { download, contextMenu } });

    expect(getButtonsFor(entity)).toEqual({ download });
  });

  it("keeps the context menu outside a parent entity when forced", () => {
    const entity = makeEntity({
      forceShowContextMenuActions: true,
      buttons: { download, contextMenu },
    });

    expect(getButtonsFor(entity)).toEqual({ download, contextMenu });
  });

  it("returns undefined when the row configures no buttons", () => {
    expect(getButtonsFor(makeEntity({}))).toBeUndefined();
  });
});

describe("useEntityListHelpers.actionOnClick", () => {
  const entity = { id: "MF-1", type: "mediafile" } as unknown as Entity;

  const helpersFor = (actionOnClick?: ActionOnClick, previewOpen = false) => {
    const openPreviewComponent = vi.fn();
    const togglePreviewForListItem = vi.fn();
    const helpers = useEntityListHelpers(
      actionOnClick ? { actionOnClick } : {},
      ref([]),
      ref(previewOpen),
      openPreviewComponent,
      togglePreviewForListItem,
    );
    return { helpers, openPreviewComponent, togglePreviewForListItem };
  };

  const tagFor = (actionOnClick?: ActionOnClick, previewOpen = false) =>
    helpersFor(actionOnClick, previewOpen).helpers.getLinkSettings(entity).tag;

  it("links to the detail page by default", () => {
    expect(tagFor()).toBe("router-link");
    expect(tagFor(ActionOnClick.Navigate)).toBe("router-link");
  });

  it("stops linking while a preview is open", () => {
    expect(tagFor(ActionOnClick.Navigate, true)).toBe("div");
  });

  it.each([
    ActionOnClick.None,
    ActionOnClick.OpenPreview,
    ActionOnClick.OpenInModal,
  ])("renders %s items as a div so the click never navigates", (action) => {
    expect(tagFor(action)).toBe("div");
  });

  it("always builds the forced navigation link", () => {
    const { helpers } = helpersFor(ActionOnClick.None);
    expect(helpers.getLinkSettings(entity, "", true).tag).toBe("router-link");
  });

  it("toggles the preview on openPreview", () => {
    const { helpers, togglePreviewForListItem, openPreviewComponent } =
      helpersFor(ActionOnClick.OpenPreview, true);
    helpers.entityWrapperHandler(entity);
    expect(togglePreviewForListItem).toHaveBeenCalledWith("MF-1");
    expect(openPreviewComponent).not.toHaveBeenCalled();
  });

  it("keeps an open preview open on navigate", () => {
    const { helpers, togglePreviewForListItem, openPreviewComponent } =
      helpersFor(ActionOnClick.Navigate, true);
    helpers.entityWrapperHandler(entity);
    expect(openPreviewComponent).toHaveBeenCalledWith("MF-1");
    expect(togglePreviewForListItem).not.toHaveBeenCalled();
  });

  it.each([
    [ActionOnClick.Navigate, false],
    [ActionOnClick.None, false],
    [ActionOnClick.None, true],
  ])("does not touch the preview on %s (preview open: %s)", (action, open) => {
    const { helpers, togglePreviewForListItem, openPreviewComponent } =
      helpersFor(action, open);
    helpers.entityWrapperHandler(entity);
    expect(openPreviewComponent).not.toHaveBeenCalled();
    expect(togglePreviewForListItem).not.toHaveBeenCalled();
  });
});

describe("useEntityListHelpers inside an entity navigation scope", () => {
  const entity = { id: "W-1", type: "work" } as unknown as Entity;

  const helpersFor = (
    props: Record<string, unknown> = {},
    previewOpen = false,
  ) =>
    useEntityListHelpers(props, ref([]), ref(previewOpen), vi.fn(), vi.fn());

  beforeEach(() => {
    scoped.isScoped = true;
    scoped.navigate.mockClear();
  });

  afterEach(() => {
    scoped.isScoped = false;
  });

  it("renders a div so the router-link never touches the page", () => {
    expect(helpersFor().getLinkSettings(entity, "SingleEntity").tag).toBe(
      "div",
    );
  });

  it("navigates the scope to the entity on click", () => {
    helpersFor().entityWrapperHandler(entity, "SingleEntity");
    expect(scoped.navigate).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "W-1" },
    });
  });

  it("does not navigate a disabled entity", () => {
    helpersFor({ idsOfNonSelectableEntities: ["W-1"] }).entityWrapperHandler(
      entity,
      "SingleEntity",
    );
    expect(scoped.navigate).not.toHaveBeenCalled();
  });

  it("does not navigate while a preview is open", () => {
    helpersFor({}, true).entityWrapperHandler(entity, "SingleEntity");
    expect(scoped.navigate).not.toHaveBeenCalled();
  });

  it.each([ActionOnClick.None, ActionOnClick.OpenPreview])(
    "does not navigate on %s",
    (actionOnClick) => {
      helpersFor({ actionOnClick }).entityWrapperHandler(
        entity,
        "SingleEntity",
      );
      expect(scoped.navigate).not.toHaveBeenCalled();
    },
  );

  it("never navigates outside a scope; the router-link does that", () => {
    scoped.isScoped = false;
    helpersFor().entityWrapperHandler(entity, "SingleEntity");
    expect(scoped.navigate).not.toHaveBeenCalled();
  });
});
