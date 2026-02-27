/**
 * Tests for TableMetadataListField
 *
 */
import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { nextTick } from "vue";
import TableMetadataListField from "@/components/base/TableMetadataListField.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { InputFieldTypes } from "@/generated-types/queries";
import type { SubField, DropdownOption } from "@/generated-types/queries";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeField(
  key: string,
  label: string,
  type: InputFieldTypes,
  options?: DropdownOption[],
): SubField {
  return { key, label, type, options: options ?? null };
}

const textField = makeField("name", "Name", InputFieldTypes.Text);
const checkboxField = makeField("active", "Active", InputFieldTypes.Checkbox);
const dropdownField = makeField("status", "Status", InputFieldTypes.Dropdown, [
  { label: "Option A", value: "a", icon: null },
]);
const multiMetaField = makeField(
  "tags",
  "Tags",
  InputFieldTypes.DropdownMultiselectMetadata,
);
const singleMetaField = makeField(
  "category",
  "Category",
  InputFieldTypes.DropdownSingleselectMetadata,
);

// ─── Mount helper ─────────────────────────────────────────────────────────────

function mountComponent(
  props: {
    subFields?: SubField[];
    modelValue?: Record<string, any>[] | undefined;
    disabled?: boolean;
  } = {},
) {
  return shallowMount(TableMetadataListField, {
    props: {
      subFields: [textField],
      modelValue: [],
      ...props,
    },
  });
}

/** Shorthand to access the component's internal setup state. */
const vm = (w: ReturnType<typeof mountComponent>) => w.vm as any;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("TableMetadataListField", () => {
  // ── Visibility ─────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when subFields is empty", () => {
      const wrapper = mountComponent({ subFields: [] });
      expect(wrapper.find(".relation-metadata-list-field").exists()).toBe(false);
    });

    it("renders the table when subFields has entries", () => {
      const wrapper = mountComponent({ subFields: [textField] });
      expect(wrapper.find(".relation-metadata-list-field").exists()).toBe(true);
    });
  });

  // ── Grid style ─────────────────────────────────────────────────────────────

  describe("grid style", () => {
    it("assigns minmax(max-content, 1fr) for non-checkbox columns", () => {
      const wrapper = mountComponent({ subFields: [textField], disabled: true });
      const style = wrapper.find(".grid").attributes("style") ?? "";
      expect(style).toContain("minmax(max-content, 1fr)");
    });

    it("assigns max-content for checkbox columns", () => {
      const wrapper = mountComponent({
        subFields: [checkboxField],
        disabled: true,
      });
      const style = wrapper.find(".grid").attributes("style") ?? "";
      expect(style).toContain("max-content");
      expect(style).not.toContain("minmax");
    });

    it("adds an extra action column when not disabled", () => {
      const editable = mountComponent({ subFields: [textField], disabled: false });
      const disabled = mountComponent({ subFields: [textField], disabled: true });
      const countCols = (w: ReturnType<typeof mountComponent>) =>
        (w.find(".grid").attributes("style") ?? "")
          .split(" ")
          .filter((s) => s.includes("content") || s.includes("minmax")).length;
      expect(countCols(editable)).toBe(countCols(disabled) + 1);
    });
  });

  // ── Add button ─────────────────────────────────────────────────────────────

  describe("add button", () => {
    it("is shown when not disabled", () => {
      const wrapper = mountComponent({ disabled: false });
      expect(wrapper.find(".absolute.top-0.right-0").exists()).toBe(true);
    });

    it("is hidden when disabled", () => {
      const wrapper = mountComponent({ disabled: true });
      expect(wrapper.find(".absolute.top-0.right-0").exists()).toBe(false);
    });
  });

  // ── Delete button visibility ────────────────────────────────────────────────
  describe("delete button", () => {
    it("hides all buttons when disabled", () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }, { name: "Bob" }],
        disabled: true,
      });
      expect(wrapper.findAllComponents(BaseButtonNew)).toHaveLength(0);
    });
  });

  // ── addItem ────────────────────────────────────────────────────────────────
  describe("addItem", () => {
    it("adds a new row to internal items state after clicking add", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [],
        disabled: false,
      });

      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");

      expect(vm(wrapper).items).toHaveLength(1);
    });

    it("emits update:modelValue including the new empty row", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [],
        disabled: false,
      });

      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");

      const emitted = wrapper.emitted("update:modelValue")!;
      expect(emitted).toBeTruthy();
      const payload = emitted[0][0] as Record<string, any>[];
      expect(payload).toHaveLength(1);
    });

    it("initialises Text fields to an empty string", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [],
        disabled: false,
      });

      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");

      const payload = (wrapper.emitted("update:modelValue")![0][0]) as Record<string, any>[];
      expect(payload[0].name).toBe("");
    });

    it("initialises Checkbox fields to false", async () => {
      const wrapper = mountComponent({
        subFields: [checkboxField],
        modelValue: [],
        disabled: false,
      });

      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");

      const payload = (wrapper.emitted("update:modelValue")![0][0]) as Record<string, any>[];
      expect(payload[0].active).toBe(false);
    });

    it("preserves existing items alongside the new empty row", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }],
        disabled: false,
      });

      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");

      const emitted = wrapper.emitted("update:modelValue")!;
      const payload = emitted[emitted.length - 1][0] as Record<string, any>[];
      expect(payload).toHaveLength(2);
      expect(payload[0].name).toBe("Alice");
      expect(payload[1].name).toBe("");
    });
  });

  // ── removeItem ─────────────────────────────────────────────────────────────

  describe("removeItem", () => {
    it("removes the correct row and emits the updated list", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }, { name: "Bob" }],
        disabled: false,
      });

      vm(wrapper).removeItem(0);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue")!;
      const payload = emitted[emitted.length - 1][0] as Record<string, any>[];
      expect(payload).toHaveLength(1);
      expect(payload[0].name).toBe("Bob");
    });

    it("removes the correct item when deleting from the middle", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }],
        disabled: false,
      });

      vm(wrapper).removeItem(1); // remove Bob
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue")!;
      const payload = emitted[emitted.length - 1][0] as Record<string, any>[];
      expect(payload.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
    });
  });

  // ── updateValue ────────────────────────────────────────────────────────────

  describe("updateValue", () => {
    it("emits the updated row value when a field changes", async () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }],
        disabled: false,
      });

      vm(wrapper).updateValue(0, "name", "Bob");
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue")!;
      const payload = emitted[0][0] as Record<string, any>[];
      expect(payload[0].name).toBe("Bob");
    });

    it("only mutates the changed cell, preserving other fields in the row", async () => {
      const wrapper = mountComponent({
        subFields: [textField, checkboxField],
        modelValue: [{ name: "Alice", active: true }],
        disabled: false,
      });

      vm(wrapper).updateValue(0, "name", "Bob");
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue")!;
      const payload = emitted[0][0] as Record<string, any>[];
      expect(payload[0].name).toBe("Bob");
      expect(payload[0].active).toBe(true);
    });
  });

  // ── modelValue watcher ─────────────────────────────────────────────────────
  describe("modelValue watcher", () => {
    it("initialises items from modelValue on mount", () => {
      const wrapper = mountComponent({
        subFields: [textField],
        modelValue: [{ name: "Alice" }, { name: "Bob" }],
      });
      expect(vm(wrapper).items).toHaveLength(2);
      expect(vm(wrapper).items[0].name).toBe("Alice");
    });

  });
});
