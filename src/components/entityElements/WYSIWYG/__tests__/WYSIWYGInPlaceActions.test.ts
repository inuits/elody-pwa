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
      dirty: false,
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
    it("replaces the edit button with save and cancel", () => {
      const wrapper = mountActions({ editing: true });
      expect(editButton(wrapper).exists()).toBe(false);
      expect(buttonLabelled(wrapper, "Save")).toBeDefined();
      expect(buttonLabelled(wrapper, "Cancel")).toBeDefined();
    });

    it("disables save until something changed", () => {
      const wrapper = mountActions({ editing: true });
      expect(buttonLabelled(wrapper, "Save")!.attributes("disabled")).toBeDefined();
    });

    it("saves a changed field", async () => {
      const wrapper = mountActions({ editing: true, dirty: true });
      await buttonLabelled(wrapper, "Save")!.trigger("click");
      expect(wrapper.emitted("save")).toHaveLength(1);
    });

    it("cancels", async () => {
      const wrapper = mountActions({ editing: true });
      await buttonLabelled(wrapper, "Cancel")!.trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("locks both buttons while saving", () => {
      const wrapper = mountActions({ editing: true, dirty: true, saving: true });
      wrapper
        .findAll("button")
        .forEach((button) => expect(button.attributes("disabled")).toBeDefined());
    });
  });
});
