import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import WYSIWYGInPlaceActions from "@/components/entityElements/WYSIWYG/WYSIWYGInPlaceActions.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

const mountActions = (props: Record<string, unknown> = {}) =>
  mount(WYSIWYGInPlaceActions, {
    props: {
      label: "Beschrijving",
      canEdit: true,
      editing: false,
      saving: false,
      ...props,
    },
    global: { stubs: { unicon: true, SpinnerLoader: true, BaseTooltip: true } },
  });

const editButton = (wrapper: ReturnType<typeof mountActions>) =>
  wrapper.find('[data-cy="wysiwyg-edit-button"]');
const buttonLabelled = (
  wrapper: ReturnType<typeof mountActions>,
  label: string,
) => wrapper.findAll("button").find((button) => button.text() === label);

describe("WYSIWYGInPlaceActions", () => {
  describe("at rest", () => {
    it("offers an edit button named after the field", () => {
      expect(editButton(mountActions()).attributes("aria-label")).toBe(
        "Beschrijving, edit",
      );
    });

    it("draws the pencil like a field row's: subtle ink, the same size", () => {
      const button = editButton(mountActions());
      expect(button.classes()).toContain("text-text-subtle");
      expect(button.find("unicon-stub").attributes("height")).toBe("12");
    });

    it("opens editing from the edit button", async () => {
      const wrapper = mountActions();
      await editButton(wrapper).trigger("click");
      expect(wrapper.emitted("edit")).toHaveLength(1);
    });

    it("renders nothing when the field can't be edited in place", () => {
      const wrapper = mountActions({ canEdit: false });
      expect(wrapper.find("button").exists()).toBe(false);
    });

    it("shows no save or cancel", () => {
      const wrapper = mountActions();
      expect(buttonLabelled(wrapper, "Save")).toBeUndefined();
      expect(buttonLabelled(wrapper, "Cancel")).toBeUndefined();
    });
  });

  describe("while editing", () => {
    const named = (wrapper: ReturnType<typeof mountActions>, name: string) =>
      wrapper.find(`button[aria-label="${name}"]`);

    // ui_kits InlineEditor: a commit-teal ✓ and a neutral × after the input.
    it("replaces the edit button with a ✓ and a ×, named after the field", () => {
      const wrapper = mountActions({ editing: true });
      expect(editButton(wrapper).exists()).toBe(false);
      expect(named(wrapper, "Save Beschrijving").exists()).toBe(true);
      expect(named(wrapper, "Cancel Beschrijving").exists()).toBe(true);
    });

    it("saves with ✓", async () => {
      const wrapper = mountActions({ editing: true });
      await named(wrapper, "Save Beschrijving").trigger("click");
      expect(wrapper.emitted("save")).toHaveLength(1);
    });

    it("cancels with ×", async () => {
      const wrapper = mountActions({ editing: true });
      await named(wrapper, "Cancel Beschrijving").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("shows only a spinner while saving", () => {
      const wrapper = mountActions({ editing: true, saving: true });
      expect(named(wrapper, "Save Beschrijving").exists()).toBe(false);
      expect(named(wrapper, "Cancel Beschrijving").exists()).toBe(false);
      expect(wrapper.find('[data-cy="wysiwyg-saving"]').exists()).toBe(true);
    });

    it("shows no spinner when not saving", () => {
      const wrapper = mountActions({ editing: true });
      expect(wrapper.find('[data-cy="wysiwyg-saving"]').exists()).toBe(false);
    });
  });
});
