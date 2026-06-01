import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, reactive } from "vue";
import { flushPromises } from "@vue/test-utils";
import { usePreviewComponent } from "../usePreviewComponent";
import {
  BaseLibraryModes,
  ListItemCoverageTypes,
  Entitytyping,
  type Entity,
  type PreviewComponent,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";

vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn() },
}));

const makeEntity = (id: string): Entity => ({ id }) as Entity;

type PreviewComponentOverrides = Partial<
  Omit<PreviewComponent, "previewConfiguration" | "__typename">
> & {
  keepLastActiveItemHighlighted?: boolean;
};

const makePreviewComponent = (
  overrides: PreviewComponentOverrides = {},
): PreviewComponent => {
  const { keepLastActiveItemHighlighted, ...componentOverrides } = overrides;
  return {
    listItemsCoverage: ListItemCoverageTypes.OneListItem,
    ...componentOverrides,
    previewConfiguration: {
      keepLastActiveItemHighlighted,
    },
  } as PreviewComponent;
};

const setup = async (
  previewComponentOverrides: PreviewComponentOverrides = {},
) => {
  vi.mocked(apolloClient.query).mockResolvedValue({
    data: {
      PreviewComponents: {
        previewComponent: makePreviewComponent(previewComponentOverrides),
      },
    },
  });
  const entities = ref([
    makeEntity("entity-1"),
    makeEntity("entity-2"),
    makeEntity("entity-3"),
  ]);
  const props = reactive({
    entityType: Entitytyping.Asset,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  });
  const composable = usePreviewComponent(props, entities);
  await flushPromises();
  return { ...composable, entities, props };
};

describe("usePreviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("togglePreviewComponent — OneListItem coverage", () => {
    it("enables the preview panel for the toggled entity", async () => {
      const {
        togglePreviewComponent,
        previewComponentEnabled,
        previewForEntity,
      } = await setup();

      togglePreviewComponent("entity-1");

      expect(previewComponentEnabled.value).toBe(true);
      expect(previewForEntity.value).toBe("entity-1");
    });

    it("disables the preview panel when the same entity is toggled again", async () => {
      const { togglePreviewComponent, previewComponentEnabled } = await setup();

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-1");

      expect(previewComponentEnabled.value).toBe(false);
    });

    it("switches the active entity without closing when a different entity is toggled", async () => {
      const {
        togglePreviewComponent,
        previewComponentEnabled,
        previewForEntity,
      } = await setup();

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-2");

      expect(previewComponentEnabled.value).toBe(true);
      expect(previewForEntity.value).toBe("entity-2");
    });

    it("tracks the last previewed entity when opening", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup({
          keepLastActiveItemHighlighted: true,
        });

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-2");

      // entity-2 is now open — both entity-2 (active) and entity-1 (last?) should be considered
      // after closing, only entity-2 should remain highlighted as the last one
      togglePreviewComponent("entity-2"); // close panel

      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(true);
      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });

    it("does not update lastPreviewedEntityId when toggling an open preview off", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup({
          keepLastActiveItemHighlighted: true,
        });

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-2");
      togglePreviewComponent("entity-2"); // close entity-2

      // entity-2 was the last one opened, so it stays highlighted
      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(true);
    });
  });

  describe("togglePreviewComponent — AllListItems coverage", () => {
    it("enables the preview panel on first toggle", async () => {
      const { togglePreviewComponent, previewComponentEnabled } = await setup({
        listItemsCoverage: ListItemCoverageTypes.AllListItems,
      });

      togglePreviewComponent("entity-1");

      expect(previewComponentEnabled.value).toBe(true);
    });

    it("disables the preview panel on second toggle", async () => {
      const { togglePreviewComponent, previewComponentEnabled } = await setup({
        listItemsCoverage: ListItemCoverageTypes.AllListItems,
      });

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-1");

      expect(previewComponentEnabled.value).toBe(false);
    });
  });

  describe("closePreviewComponent", () => {
    it("disables the preview panel", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        previewComponentEnabled,
      } = await setup();

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(previewComponentEnabled.value).toBe(false);
    });

    it("clears previewForEntity", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        previewForEntity,
      } = await setup();

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(previewForEntity.value).toBeUndefined();
    });

    it("preserves the last highlighted entity after close when keepLastActiveItemHighlighted is enabled", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup({ keepLastActiveItemHighlighted: true });

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(true);
    });

    it("does not highlight any entity after close when keepLastActiveItemHighlighted is disabled", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup({ keepLastActiveItemHighlighted: false });

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });
  });

  describe("isPreviewComponentEnabledForListItem — panel open, OneListItem", () => {
    it("returns true for the currently active entity", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup();

      togglePreviewComponent("entity-1");

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(true);
    });

    it("returns false for a different entity", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup();

      togglePreviewComponent("entity-1");

      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(false);
    });
  });

  describe("isPreviewComponentEnabledForListItem — panel open, AllListItems", () => {
    it("returns true for any entity", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup({
          listItemsCoverage: ListItemCoverageTypes.AllListItems,
        });

      togglePreviewComponent("entity-1");

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(true);
      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(true);
      expect(isPreviewComponentEnabledForListItem("entity-3")).toBe(true);
    });
  });

  describe("isPreviewComponentEnabledForListItem — panel closed", () => {
    it("returns false when no preview was opened", async () => {
      const { isPreviewComponentEnabledForListItem } = await setup();

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });

    it("returns false after closing when keepLastActiveItemHighlighted is not set", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup();

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });
  });

  describe("isPreviewComponentEnabledForListItem — keepLastActiveItemHighlighted", () => {
    it("returns false when no entity was ever previewed", async () => {
      const { isPreviewComponentEnabledForListItem } = await setup({
        keepLastActiveItemHighlighted: true,
      });

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });

    it("returns true for the last previewed entity while the panel is still open", async () => {
      const { togglePreviewComponent, isPreviewComponentEnabledForListItem } =
        await setup({
          keepLastActiveItemHighlighted: true,
        });

      togglePreviewComponent("entity-1");

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(true);
    });

    it("returns true for the last previewed entity after the panel closes", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup({ keepLastActiveItemHighlighted: true });

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(true);
    });

    it("returns false for an entity that was never the last previewed", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup({ keepLastActiveItemHighlighted: true });

      togglePreviewComponent("entity-1");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(false);
    });

    it("updates the highlighted entity when a new one is opened", async () => {
      const {
        togglePreviewComponent,
        closePreviewComponent,
        isPreviewComponentEnabledForListItem,
      } = await setup({ keepLastActiveItemHighlighted: true });

      togglePreviewComponent("entity-1");
      togglePreviewComponent("entity-2");
      closePreviewComponent();

      expect(isPreviewComponentEnabledForListItem("entity-2")).toBe(true);
      expect(isPreviewComponentEnabledForListItem("entity-1")).toBe(false);
    });
  });

  describe("initial fetch — getPreviewItemsForEntity", () => {
    it("queries apolloClient with the entity type on mount", async () => {
      await setup();

      expect(apolloClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { entityType: Entitytyping.Asset },
        }),
      );
    });

    it("sets previewComponent from the query response", async () => {
      const { previewComponent } = await setup({
        keepLastActiveItemHighlighted: true,
      });

      expect(
        previewComponent.value?.previewConfiguration
          ?.keepLastActiveItemHighlighted,
      ).toBe(true);
    });

    it("skips fetching when baseLibraryMode is not NormalBaseLibrary or PreviewBaseLibrary", async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { PreviewComponents: { previewComponent: null } },
      });
      const entities = ref([makeEntity("entity-1")]);
      const props = reactive({
        entityType: Entitytyping.Asset,
        baseLibraryMode: BaseLibraryModes.SelectBaseLibrary,
      });
      usePreviewComponent(props, entities);
      await flushPromises();

      expect(apolloClient.query).not.toHaveBeenCalled();
    });

    it("opens the first entity by default when openByDefault is true", async () => {
      const { previewComponentEnabled, previewForEntity } = await setup({
        openByDefault: true,
      });

      expect(previewComponentEnabled.value).toBe(true);
      expect(previewForEntity.value).toBe("entity-1");
    });
  });
});
