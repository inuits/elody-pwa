import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";
import { isCompact } from "@/composables/useNavMenu";
import { computed } from "vue";
import { rowSheetKey, type RowSheet } from "@/components/context-menu-actions/rowSheet";

vi.mock("@/composables/useNavMenu", async () => {
  const { ref } = await import("vue");
  return { isCompact: ref(false) };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${Object.values(params).join(",")}` : key,
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    AngleDown: { name: "angle-down" },
    AngleUp: { name: "angle-up" },
    EllipsisV: { name: "ellipsis-v" },
    Eye: { name: "eye" },
    QuestionCircle: { name: "question-circle" },
  },
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  mount(ContextMenuActionsShell, {
    props: { hasPromotedActions: false, hasOverflowActions: true, ...props },
    slots: { promoted: '<button data-test="primary">Open record</button>' },
    attachTo: document.body,
    global: { stubs: { unicon: true, BaseContextMenu: true } },
  });

describe("ContextMenuActionsShell", () => {
  it("labels the overflow trigger instead of showing a bare glyph", () => {
    const trigger = getWrapper().find("button");

    expect(trigger.text()).toContain("contextMenu.actions");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
  });

  it("renders the overflow trigger as a bordered secondary button", () => {
    expect(
      getWrapper().findComponent({ name: "BaseButtonNew" }).props("buttonStyle"),
    ).toBe("secondary");
  });

  it("names the trigger after its scope when a label is given", () => {
    const trigger = getWrapper({ contextLabel: "Brief aan Jan" }).find(
      "button",
    );

    expect(trigger.attributes("aria-label")).toBe(
      "contextMenu.actions-for:Brief aan Jan",
    );
  });

  it("toggles aria-expanded when the trigger opens and closes the menu", async () => {
    const trigger = getWrapper().find("button");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("opens the menu with the down arrow", async () => {
    const trigger = getWrapper().find("button");

    await trigger.trigger("keydown", { key: "ArrowDown" });

    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("renders no trigger without overflow actions", () => {
    expect(getWrapper({ hasOverflowActions: false }).find("button").exists())
      .toBe(false);
  });

  describe("on a small screen", () => {
    beforeEach(() => {
      isCompact.value = true;
    });
    afterEach(() => {
      isCompact.value = false;
    });

    it("shrinks the trigger to a ⋮ that keeps its name", () => {
      const trigger = getWrapper({ contextLabel: "Brief aan Jan" }).find(
        "button",
      );

      expect(trigger.text()).not.toContain("contextMenu.actions");
      expect(trigger.find('[name="ellipsis-v"]').exists()).toBe(true);
      expect(trigger.attributes("aria-label")).toBe(
        "contextMenu.actions-for:Brief aan Jan",
      );
    });

    describe("in a list row", () => {
      const preview = vi.fn();
      const mountRow = (
        props: Record<string, unknown> = {},
        sheet: Partial<RowSheet> = {},
      ) =>
        mount(ContextMenuActionsShell, {
          props: { hasPromotedActions: false, hasOverflowActions: true, ...props },
          slots: { overflow: '<a role="menuitem">Delete mediafile</a>' },
          attachTo: document.body,
          global: {
            stubs: {
              unicon: true,
              BaseIcon: true,
              BaseTooltip: true,
              ImageViewer: { props: ["url"], template: '<img :src="url" />' },
              BaseContextMenu: { template: "<div><slot /></div>" },
            },
            provide: {
              [rowSheetKey as symbol]: computed<RowSheet>(() => ({
                id: "mediafile-1",
                title: "sheep.JPEG",
                thumbnailUrl: "/thumb.jpg",
                thumbnailIsLink: false,
                preview,
                ...sheet,
              })),
            },
          },
        });

      it("tops the sheet with the file it acts on", () => {
        const header = mountRow().find('[data-cy="row-sheet-header"]');

        expect(header.text()).toContain("sheep.JPEG");
        expect(header.find("img").attributes("src")).toBe("/thumb.jpg");
      });

      it("leads with Preview, which opens the row's preview", async () => {
        const items = mountRow().findAll('[role="menuitem"]');

        expect(items.map((item) => item.text())).toEqual([
          "preview-component.open",
          "Delete mediafile",
        ]);
        await items[0].trigger("click");
        expect(preview).toHaveBeenCalled();
      });

      it("offers the ⋮ for the preview alone", () => {
        const trigger = mountRow({ hasOverflowActions: false }).find(
          '[data-cy="overflow-menu-trigger"]',
        );

        expect(trigger.exists()).toBe(true);
      });

      it("takes focus back when the preview closes, as the eye did", () => {
        const trigger = mountRow().find('[data-cy="overflow-menu-trigger"]');

        expect(trigger.attributes("data-preview-for")).toBe("mediafile-1");
      });

      it("has no Preview without one", () => {
        const items = mountRow({}, { preview: undefined }).findAll(
          '[role="menuitem"]',
        );

        expect(items).toHaveLength(1);
      });
    });

    it("still has a name without a scope", () => {
      expect(getWrapper().find("button").attributes("aria-label")).toBe(
        "contextMenu.actions",
      );
    });
  });

  describe("in a list row on a large screen", () => {
    const mountRow = (props: Record<string, unknown> = {}) =>
      mount(ContextMenuActionsShell, {
        props: { hasPromotedActions: false, hasOverflowActions: true, ...props },
        slots: { overflow: '<a role="menuitem">Delete mediafile</a>' },
        attachTo: document.body,
        global: {
          stubs: {
            unicon: true,
            BaseContextMenu: { template: "<div><slot /></div>" },
          },
          provide: {
            [rowSheetKey as symbol]: computed<RowSheet>(() => ({
              id: "mediafile-1",
              title: "sheep.JPEG",
              thumbnailUrl: "/thumb.jpg",
              thumbnailIsLink: false,
              preview: vi.fn(),
            })),
          },
        },
      });

    it("shows a ⋮ under the list's Actions column, named after the row", () => {
      const trigger = mountRow({ contextLabel: "sheep.JPEG" }).find(
        '[data-cy="overflow-menu-trigger"]',
      );

      expect(trigger.text()).not.toContain("contextMenu.actions");
      expect(trigger.find('[name="ellipsis-v"]').exists()).toBe(true);
      expect(trigger.attributes("aria-label")).toBe(
        "contextMenu.actions-for:sheep.JPEG",
      );
    });

    it("keeps the dropdown plain: the row has its own eye for the preview", () => {
      const wrapper = mountRow();

      expect(wrapper.find('[data-cy="row-sheet-header"]').exists()).toBe(false);
      expect(wrapper.findAll('[role="menuitem"]').map((item) => item.text())).toEqual([
        "Delete mediafile",
      ]);
      expect(
        wrapper.find('[data-cy="overflow-menu-trigger"]').attributes("data-preview-for"),
      ).toBeUndefined();
    });

    it("renders no ⋮ without row actions", () => {
      expect(
        mountRow({ hasOverflowActions: false })
          .find('[data-cy="overflow-menu-trigger"]')
          .exists(),
      ).toBe(false);
    });
  });

  describe("as a split button", () => {
    const getSplit = (props: Record<string, unknown> = {}) =>
      getWrapper({ hasPromotedActions: true, split: true, ...props });

    it("joins the primary action and a chevron in one group", () => {
      const group = getSplit().find('[role="group"]');

      expect(group.find('[data-test="primary"]').exists()).toBe(true);
      expect(group.find('[aria-haspopup="menu"]').exists()).toBe(true);
    });

    it("gives the chevron an accent fill and no visible label", () => {
      const chevron = getSplit().findComponent({ name: "BaseButtonNew" });

      expect(chevron.props("buttonStyle")).toBe("primary");
      expect(chevron.text()).not.toContain("contextMenu.actions");
    });

    it("names the chevron after the entity", () => {
      const chevron = getSplit({ contextLabel: "Brief aan Jan" }).find(
        '[aria-haspopup="menu"]',
      );

      expect(chevron.attributes("aria-label")).toBe(
        "contextMenu.more-actions-for:Brief aan Jan",
      );
    });

    it("falls back to a generic chevron name without a title", () => {
      expect(
        getSplit().find('[aria-haspopup="menu"]').attributes("aria-label"),
      ).toBe("contextMenu.more-actions");
    });

    it("opens the menu from the chevron", async () => {
      const chevron = getSplit().find('[aria-haspopup="menu"]');

      await chevron.trigger("click");

      expect(chevron.attributes("aria-expanded")).toBe("true");
    });
  });

  it("opens its menu from an anchor the parent hands it", async () => {
    const wrapper = getWrapper();
    const anchor = document.createElement("button");

    (wrapper.vm as any).openFrom(anchor);
    await wrapper.vm.$nextTick();

    expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
  });

  it("tells the parent when its own trigger opens the menu", async () => {
    const wrapper = getWrapper();

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("open")).toHaveLength(1);
  });

  it("uses a caller's trigger label instead of Actions", () => {
    const trigger = getWrapper({ triggerLabel: "Saved searches" }).find(
      "button",
    );

    expect(trigger.text()).toContain("Saved searches");
    expect(trigger.text()).not.toContain("contextMenu.actions");
  });
});
