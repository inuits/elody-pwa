import { describe, it, expect, vi, afterEach } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { nextTick } from "vue";

vi.mock("@/components/base/BaseDatePicker.vue", () => ({
  default: { name: "BaseDatePicker", template: "<div />" },
}));
vi.mock("@/components/base/BaseResizableTextarea.vue", () => ({
  default: { name: "BaseResizableTextarea", template: "<div />" },
}));
vi.mock("@/components/base/AdvancedDropdown.vue", () => ({
  default: {
    name: "AdvancedDropdown",
    props: ["modelValue", "options", "clearable", "multiple"],
    emits: ["update:modelValue"],
    template: "<div data-cy='dropdown' />",
  },
}));
vi.mock("@/components/base/BaseInputCheckbox.vue", () => ({
  default: {
    name: "BaseInputCheckbox",
    props: ["modelValue", "ariaLabel"],
    emits: ["update:modelValue"],
    template: "<input type='checkbox' data-cy='checkbox' />",
  },
}));
vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: {
    name: "BaseButtonNew",
    props: {
      label: String,
      buttonStyle: String,
      buttonSize: String,
      disabled: Boolean,
      loading: Boolean,
      forceShowLabel: Boolean,
    },
    emits: ["click"],
    template:
      "<button :data-cy=\"'button-' + buttonStyle\" :disabled='disabled' @click=\"$emit('click')\">{{ label }}</button>",
  },
}));

import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";

// Each editor listens on the page while it's open; unmount them all so no
// earlier test's editor handles a later test's keys.
enableAutoUnmount(afterEach);

const editor = (props: Record<string, unknown> = {}) =>
  mount(InlineFieldEditor, {
    props: { type: "text", modelValue: "1958", label: "Jaar", ...props },
    attachTo: document.body,
  });

const input = (wrapper: ReturnType<typeof editor>) =>
  wrapper.find('[data-cy="base-input-text"]');

describe("InlineFieldEditor", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("commit model", () => {
    // Leaving the editor saves it, so there is no Bewaar per field.
    it("has no Bewaar button, only Annuleer", () => {
      const wrapper = editor();
      expect(wrapper.find('[data-cy="button-commit"]').exists()).toBe(false);
      expect(wrapper.find('[data-cy="button-ghost"]').exists()).toBe(true);
    });

    it("cancels with Annuleer", async () => {
      const wrapper = editor();
      await wrapper.find('[data-cy="button-ghost"]').trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("reports the current draft as it changes", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      expect(wrapper.emitted("draft-change")?.at(-1)).toEqual(["1959"]);
    });

    it("reports whether the draft is changed", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      expect(wrapper.emitted("dirty-change")?.at(-1)).toEqual([true]);
    });
  });

  describe("keyboard", () => {
    it("saves with Enter when changed", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      await input(wrapper).trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
    });

    it("closes with Enter when nothing changed", async () => {
      const wrapper = editor();
      await input(wrapper).trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("cancels with Escape", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      await wrapper.find('[data-cy="inline-field-editor"]').trigger("keydown", {
        key: "Escape",
      });
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("keeps Enter as a new line in a textarea and saves with Ctrl+Enter", async () => {
      const wrapper = editor({ type: "textarea", modelValue: "a" });
      const textarea = wrapper.find('[data-cy="base-input-text-area"]');
      await textarea.setValue("ab");
      await textarea.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")).toBeUndefined();
      await textarea.trigger("keydown", { key: "Enter", ctrlKey: true });
      expect(wrapper.emitted("save")?.[0]).toEqual(["ab"]);
    });

    it("grows a textarea with its content, up to 6 rows", () => {
      const box = editor({ type: "textarea", modelValue: "a" }).find(
        '[data-cy="inline-editor-input"]',
      );
      expect(box.classes()).toEqual(
        expect.arrayContaining([
          "[&_textarea]:field-sizing-content",
          "[&_textarea]:max-h-(--textarea-max-height)",
        ]),
      );
    });

    it("leaves other inputs at their own height", () => {
      const box = editor({ type: "text", modelValue: "a" }).find(
        '[data-cy="inline-editor-input"]',
      );
      expect(box.classes()).not.toContain("[&_textarea]:field-sizing-content");
    });

    it("leaves Enter and Escape typed in its own dialog (the entity picker) to that dialog", async () => {
      const wrapper = mount(InlineFieldEditor, {
        props: { type: "text", modelValue: "a", label: "Gezelschap", dirty: true },
        slots: {
          input:
            "<input data-cy='own-input' /><dialog open><input data-cy='picker-search' /></dialog>",
        },
        attachTo: document.body,
      });
      const search = wrapper.find('[data-cy="picker-search"]');
      await search.trigger("keydown", { key: "Enter" });
      await search.trigger("keydown", { key: "Escape" });
      expect(wrapper.emitted("save")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toBeUndefined();
      await wrapper.find('[data-cy="own-input"]').trigger("keydown", { key: "Escape" });
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    describe("after picking in a dropdown (focus left the editor)", () => {
      const pressOnPage = (key: string) =>
        document.body.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
        );

      it("saves with Enter", async () => {
        const wrapper = editor();
        await input(wrapper).setValue("1959");
        pressOnPage("Enter");
        expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
      });

      it("cancels with Escape", () => {
        const wrapper = editor();
        pressOnPage("Escape");
        expect(wrapper.emitted("cancel")).toHaveLength(1);
      });

      it("leaves Enter and Escape to a dropdown menu that is still open", async () => {
        const wrapper = editor();
        await input(wrapper).setValue("1959");
        const menu = document.createElement("div");
        menu.setAttribute("role", "listbox");
        menu.id = "vue-select-1-listbox";
        document.body.appendChild(menu);
        pressOnPage("Enter");
        pressOnPage("Escape");
        expect(wrapper.emitted("save")).toBeUndefined();
        expect(wrapper.emitted("cancel")).toBeUndefined();
      });

      it("ignores keys typed in another field on the page", async () => {
        const wrapper = editor();
        const other = document.createElement("input");
        document.body.appendChild(other);
        other.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
        );
        expect(wrapper.emitted("cancel")).toBeUndefined();
      });

      it("stops listening once closed", () => {
        const wrapper = editor();
        wrapper.unmount();
        pressOnPage("Escape");
        expect(wrapper.emitted("cancel")).toBeUndefined();
      });
    });

    it("shows the keyboard hint under the editor", () => {
      expect(editor().find('[data-cy="inline-editor-hint"]').text()).toBe(
        "Enter saves · Esc cancels",
      );
    });

    it("hints Ctrl+Enter for a textarea", () => {
      expect(
        editor({ type: "textarea" }).find('[data-cy="inline-editor-hint"]').text(),
      ).toBe("Ctrl+Enter saves · Esc cancels");
    });

    it("focuses the input when it opens", async () => {
      const wrapper = editor();
      await nextTick();
      expect(document.activeElement).toBe(input(wrapper).element);
    });
  });

  describe("layout", () => {
    it("centres Annuleer vertically on the input", () => {
      const row = editor().find('[data-cy="inline-editor-row"]');
      expect(row.classes()).toContain("items-center");
      expect(row.classes()).not.toContain("items-start");
    });

    it("lets a text input take the row, with Annuleer at its end", () => {
      const input = editor().find('[data-cy="inline-editor-input"]');
      expect(input.classes()).toContain("grow");
    });

    // The dropdown keeps its options' width; where that and Annuleer do
    // not fit (a narrow window), Annuleer wraps below it.
    it("wraps Annuleer below a dropdown that does not fit beside it", () => {
      const row = editor({
        type: "dropdownSingleselectMetadata",
        modelValue: "book",
        options: [{ label: "Boek", value: "book" }],
      }).find('[data-cy="inline-editor-row"]');
      expect(row.classes()).toContain("flex-wrap");
    });

    it("keeps a text input and Annuleer on one row", () => {
      const row = editor().find('[data-cy="inline-editor-row"]');
      expect(row.classes()).not.toContain("flex-wrap");
    });

    // Annuleer has no icon: a narrow window must not hide its label and
    // leave an empty button.
    it("always shows the label of Annuleer", () => {
      const buttons = editor().findAllComponents({ name: "BaseButtonNew" });
      expect(buttons.map((button) => button.props("forceShowLabel"))).toEqual([
        true,
      ]);
    });

    it("keeps a checkbox only as wide as the box, with Annuleer right after it", () => {
      const input = editor({ type: "checkbox", modelValue: false }).find(
        '[data-cy="inline-editor-input"]',
      );
      expect(input.classes()).not.toContain("grow");
      expect(input.classes()).toContain("shrink-0");
    });
  });

  describe("inputs per type", () => {
    it("uses the dropdown for select fields, clearable unless required", () => {
      const options = [{ label: "Boek", value: "book" }];
      const dropdown = editor({
        type: "dropdownSingleselectMetadata",
        modelValue: "book",
        options,
      }).findComponent({ name: "AdvancedDropdown" });
      expect(dropdown.props("options")).toEqual(options);
      expect(dropdown.props("clearable")).toBe(true);
      expect(dropdown.props("multiple")).toBe(false);
    });

    it("makes the dropdown multiple for multi-select fields", () => {
      expect(
        editor({ type: "dropdownMultiselectMetadata", modelValue: [] })
          .findComponent({ name: "AdvancedDropdown" })
          .props("multiple"),
      ).toBe(true);
    });

    it("never offers an empty choice for a required select", () => {
      expect(
        editor({ type: "dropdown", modelValue: "book", required: true })
          .findComponent({ name: "AdvancedDropdown" })
          .props("clearable"),
      ).toBe(false);
    });

    it("uses a checkbox for boolean fields", () => {
      expect(
        editor({ type: "checkbox", modelValue: false })
          .findComponent({ name: "BaseInputCheckbox" })
          .exists(),
      ).toBe(true);
    });
  });

  describe("saving and errors", () => {
    it("locks the input and shows a spinner while saving", () => {
      const wrapper = editor({ saving: true });
      expect(input(wrapper).attributes("disabled")).toBeDefined();
      expect(wrapper.find('[data-cy="inline-editor-saving"]').exists()).toBe(true);
    });

    it("shows no spinner when not saving", () => {
      expect(editor().find('[data-cy="inline-editor-saving"]').exists()).toBe(false);
    });

    it("shows an error as an alert linked to the input", () => {
      const wrapper = editor({ errorMessage: "Jaar is verplicht" });
      const alert = wrapper.find('[role="alert"]');
      expect(alert.text()).toBe("Jaar is verplicht");
      expect(input(wrapper).attributes("aria-describedby")).toContain(
        alert.attributes("id"),
      );
    });
  });

  describe("click outside", () => {
    it("closes an unchanged editor", async () => {
      const wrapper = editor();
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("saves a changed editor", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });

    it("treats clicks in the input's menu as inside", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      const menu = document.createElement("ul");
      menu.setAttribute("role", "listbox");
      document.body.appendChild(menu);
      menu.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("save")).toBeUndefined();
    });

    it("treats clicks in a dialog the input opened (a confirm) as inside", async () => {
      const wrapper = editor();
      const dialog = document.createElement("dialog");
      document.body.appendChild(dialog);
      dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });
  });

  describe("focus leaving (Tab)", () => {
    const outside = () => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      return button;
    };
    const leaveTo = (
      wrapper: ReturnType<typeof editor>,
      relatedTarget: EventTarget | null,
    ) =>
      input(wrapper).element.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget }),
      );

    it("saves a changed editor when focus moves outside it", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      leaveTo(wrapper, outside());
      expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
    });

    it("closes an unchanged editor when focus moves outside it", () => {
      const wrapper = editor();
      leaveTo(wrapper, outside());
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("stays open when focus moves to Annuleer", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      leaveTo(wrapper, wrapper.find('[data-cy="button-ghost"]').element);
      expect(wrapper.emitted("save")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });

    it("stays open when focus moves into the input's menu", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      const menu = document.createElement("ul");
      menu.setAttribute("role", "listbox");
      const option = document.createElement("li");
      option.tabIndex = -1;
      menu.appendChild(option);
      document.body.appendChild(menu);
      leaveTo(wrapper, option);
      expect(wrapper.emitted("save")).toBeUndefined();
    });

    // A picked option is removed with focus on it, and switching windows
    // blurs too: neither is the user leaving the field.
    it("stays open when focus goes nowhere", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      leaveTo(wrapper, null);
      expect(wrapper.emitted("save")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });
  });

  describe("keys the input already handled", () => {
    it("leaves an Enter that picked an option in the input's menu", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      input(wrapper).element.addEventListener("keydown", (e) => e.preventDefault());
      input(wrapper).element.dispatchEvent(event);
      expect(wrapper.emitted("save")).toBeUndefined();
    });

    it("leaves an Escape that closed the input's menu", async () => {
      const wrapper = editor();
      input(wrapper).element.addEventListener("keydown", (e) => e.preventDefault());
      input(wrapper).element.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      );
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });
  });

  describe("custom input (relations)", () => {
    const withSlot = (props: Record<string, unknown> = {}) =>
      mount(InlineFieldEditor, {
        props: { type: "dropdownMultiselectRelations", modelValue: undefined, label: "Maker", ...props },
        slots: { input: "<div data-cy='relation-input'>relations</div>" },
        attachTo: document.body,
      });

    it("renders the parent's input instead of a built-in one", () => {
      const wrapper = withSlot();
      expect(wrapper.find('[data-cy="relation-input"]').exists()).toBe(true);
      expect(wrapper.findComponent({ name: "AdvancedDropdown" }).exists()).toBe(false);
      expect(input(wrapper).exists()).toBe(false);
    });

    it("takes its changed state from the parent", async () => {
      const wrapper = withSlot({ dirty: false });
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("cancel")).toHaveLength(1);
      await wrapper.setProps({ dirty: true });
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("save")).toHaveLength(1);
    });

    it("saves on an outside click when the parent reports a change", () => {
      const wrapper = withSlot({ dirty: true });
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("save")).toHaveLength(1);
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });
  });
});
