import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import type {
  ContextMenuActionRouteConfig,
  EntityPageConfig,
} from "@/types/contextMenuRouteConfig";

const mockRoute = ref({
  meta: {} as Record<string, unknown>,
  params: { type: "productions" } as Record<string, unknown>,
});

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute.value,
}));

vi.mock("@/helpers", () => ({
  mapUrlToEntityType: (slug: string) => {
    const map: Record<string, string> = {
      productions: "production",
      venues: "venue",
    };
    return map[slug];
  },
}));

const downloadZipAction: ContextMenuActionRouteConfig = {
  type: "downloadZip",
  label: "contextMenu.downloadZip",
  icon: "Download",
  endpointUrl: "api/download/zip/$id",
  endpointMethod: "GET",
};

const elodyAction: ContextMenuActionRouteConfig = {
  type: "elody",
  action: "CreateEntityFromExternalSource" as any,
  label: "contextMenu.create",
  icon: "Create",
};

describe("useEntityPageConfig", () => {
  beforeEach(() => {
    mockRoute.value = {
      meta: {},
      params: { type: "productions" },
    };
  });

  describe("actions", () => {
    it("returns empty array when no entityPageConfig on route", () => {
      mockRoute.value.meta = {};

      const { actions } = useEntityPageConfig();

      expect(actions.value).toEqual([]);
    });

    it("returns actions for the current entity type", () => {
      const config: EntityPageConfig = {
        production: { actions: [downloadZipAction] },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { actions } = useEntityPageConfig();

      expect(actions.value).toEqual([downloadZipAction]);
    });

    it("returns empty array when entity type is not in config", () => {
      const config: EntityPageConfig = {
        venue: { actions: [elodyAction] },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { actions } = useEntityPageConfig();

      expect(actions.value).toEqual([]);
    });

    it("falls back to raw slug when mapUrlToEntityType returns undefined", () => {
      const config: EntityPageConfig = {
        boekenbank: { actions: [elodyAction] },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "boekenbank" } };

      const { actions } = useEntityPageConfig();

      expect(actions.value).toEqual([elodyAction]);
    });

    it("returns empty array when route params have no type", () => {
      const config: EntityPageConfig = {
        production: { actions: [downloadZipAction] },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: {} };

      const { actions } = useEntityPageConfig();

      expect(actions.value).toEqual([]);
    });
  });

  describe("hasEditMetadataButton", () => {
    it("returns undefined when no config", () => {
      const { hasEditMetadataButton } = useEntityPageConfig();
      expect(hasEditMetadataButton.value).toBeUndefined();
    });

    it("returns false when configured as false", () => {
      const config: EntityPageConfig = {
        production: { hasEditMetadataButton: false },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { hasEditMetadataButton } = useEntityPageConfig();

      expect(hasEditMetadataButton.value).toBe(false);
    });

    it("returns true when configured as true", () => {
      const config: EntityPageConfig = {
        production: { hasEditMetadataButton: true },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { hasEditMetadataButton } = useEntityPageConfig();

      expect(hasEditMetadataButton.value).toBe(true);
    });
  });

  describe("deleteButton", () => {
    it("returns undefined when not configured", () => {
      const config: EntityPageConfig = {
        production: { actions: [] },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { deleteButton } = useEntityPageConfig();

      expect(deleteButton.value).toBeUndefined();
    });

    it("returns false when delete button is disabled", () => {
      const config: EntityPageConfig = {
        production: { deleteButton: false },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { deleteButton } = useEntityPageConfig();

      expect(deleteButton.value).toBe(false);
    });

    it("returns config when custom button is configured", () => {
      const archiveConfig = { label: "header.archive", mutation: "ArchiveProduction" };
      const config: EntityPageConfig = {
        production: { deleteButton: archiveConfig },
      };
      mockRoute.value = { meta: { entityPageConfig: config }, params: { type: "productions" } };

      const { deleteButton } = useEntityPageConfig();

      expect(deleteButton.value).toEqual(archiveConfig);
    });
  });
});
