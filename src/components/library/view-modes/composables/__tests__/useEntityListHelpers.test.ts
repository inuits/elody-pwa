import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import type { Entity } from "@/generated-types/queries";
import { useEntityListHelpers } from "../useEntityListHelpers";

vi.mock("vue", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue")>()),
  inject: vi.fn((_key: string, fallback?: unknown) => fallback),
}));

vi.mock("@/helpers", () => ({
  getEntityPageRoute: vi.fn(),
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

describe("useEntityListHelpers.entityWrapperHandler", () => {
  const entity = { id: "MF-1", type: "mediafile" } as unknown as Entity;

  const clickWith = (enableNavigation: boolean, previewOpen: boolean) => {
    const openPreviewComponent = vi.fn();
    const togglePreviewForListItem = vi.fn();
    useEntityListHelpers(
      { enableNavigation },
      ref([]),
      ref(previewOpen),
      openPreviewComponent,
      togglePreviewForListItem,
    ).entityWrapperHandler(entity);
    return { openPreviewComponent, togglePreviewForListItem };
  };

  it("toggles the preview when navigation is disabled", () => {
    const { togglePreviewForListItem, openPreviewComponent } = clickWith(
      false,
      true,
    );
    expect(togglePreviewForListItem).toHaveBeenCalledWith("MF-1");
    expect(openPreviewComponent).not.toHaveBeenCalled();
  });

  it("keeps an open preview open when navigation is enabled", () => {
    const { togglePreviewForListItem, openPreviewComponent } = clickWith(
      true,
      true,
    );
    expect(openPreviewComponent).toHaveBeenCalledWith("MF-1");
    expect(togglePreviewForListItem).not.toHaveBeenCalled();
  });

  it("does not open a closed preview when navigation is enabled", () => {
    const { togglePreviewForListItem, openPreviewComponent } = clickWith(
      true,
      false,
    );
    expect(openPreviewComponent).not.toHaveBeenCalled();
    expect(togglePreviewForListItem).not.toHaveBeenCalled();
  });
});
