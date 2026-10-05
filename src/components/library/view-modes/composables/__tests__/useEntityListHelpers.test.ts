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
