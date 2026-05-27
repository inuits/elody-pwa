// src/components/metadata/tests/useMetadataVirtualKeyboard.test.ts
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { InputFieldTypes } from "@/generated-types/queries";
import { useMetadataVirtualKeyboard } from "@/composables/useMetadataVirtualKeyboard";

describe("useMetadataVirtualKeyboard", () => {
  describe("isDropdownField", () => {
    it("returns true for DropdownMultiselectRelations", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownMultiselectRelations),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(true);
    });

    it("returns true for DropdownSingleselectRelations", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownSingleselectRelations),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(true);
    });

    it("returns true for DropdownMultiselectMetadata", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownMultiselectMetadata),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(true);
    });

    it("returns true for DropdownSingleselectMetadata", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownSingleselectMetadata),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(true);
    });

    it("returns true for Dropdown", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Dropdown),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(true);
    });

    it("returns false for Text type", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(false);
    });

    it("returns false for undefined fieldType", () => {
      const { isDropdownField } = useMetadataVirtualKeyboard(
        ref(undefined),
        ref(""),
        ref(null),
      );
      expect(isDropdownField.value).toBe(false);
    });
  });

  describe("keyboardInput", () => {
    it("returns current fieldValueProxy as string for text fields", () => {
      const { keyboardInput } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        ref("hello"),
        ref(null),
      );
      expect(keyboardInput.value).toBe("hello");
    });

    it("converts null fieldValueProxy to empty string for text fields", () => {
      const { keyboardInput } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        ref(null),
        ref(null),
      );
      expect(keyboardInput.value).toBe("");
    });

    it("returns keyboardSearchQuery for dropdown fields", () => {
      const { keyboardInput, keyboardSearchQuery } =
        useMetadataVirtualKeyboard(
          ref(InputFieldTypes.DropdownMultiselectRelations),
          ref("ignored"),
          ref(null),
        );
      keyboardSearchQuery.value = "search text";
      expect(keyboardInput.value).toBe("search text");
    });

    it("ignores fieldValueProxy for dropdown fields (returns empty string initially)", () => {
      const { keyboardInput } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownMultiselectRelations),
        ref("should-not-appear"),
        ref(null),
      );
      expect(keyboardInput.value).toBe(""); // keyboardSearchQuery starts empty
    });
  });

  describe("handleKeyboardChange", () => {
    it("updates fieldValueProxy for text fields", () => {
      const fieldValueProxy = ref("old value");
      const { handleKeyboardChange } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        fieldValueProxy,
        ref(null),
      );
      handleKeyboardChange("new value");
      expect(fieldValueProxy.value).toBe("new value");
    });

    it("does not touch fieldValueProxy for dropdown fields", () => {
      const fieldValueProxy = ref("original");
      const { handleKeyboardChange } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.DropdownMultiselectRelations),
        fieldValueProxy,
        ref(null),
      );
      handleKeyboardChange("search text");
      expect(fieldValueProxy.value).toBe("original");
    });

    it("updates keyboardSearchQuery for dropdown fields", () => {
      const { handleKeyboardChange, keyboardSearchQuery } =
        useMetadataVirtualKeyboard(
          ref(InputFieldTypes.DropdownMultiselectRelations),
          ref(""),
          ref(null),
        );
      handleKeyboardChange("search text");
      expect(keyboardSearchQuery.value).toBe("search text");
    });

    it("does not touch keyboardSearchQuery for text fields", () => {
      const { handleKeyboardChange, keyboardSearchQuery } =
        useMetadataVirtualKeyboard(
          ref(InputFieldTypes.Text),
          ref(""),
          ref(null),
        );
      handleKeyboardChange("hello");
      expect(keyboardSearchQuery.value).toBe("");
    });
  });

  describe("handleKeyboardOpenState", () => {
    it("sets isKeyboardOpen to true", () => {
      const { handleKeyboardOpenState, isKeyboardOpen } =
        useMetadataVirtualKeyboard(
          ref(InputFieldTypes.Text),
          ref(""),
          ref(null),
        );
      handleKeyboardOpenState(true);
      expect(isKeyboardOpen.value).toBe(true);
    });

    it("sets isKeyboardOpen to false after being true", () => {
      const { handleKeyboardOpenState, isKeyboardOpen } =
        useMetadataVirtualKeyboard(
          ref(InputFieldTypes.Text),
          ref(""),
          ref(null),
        );
      handleKeyboardOpenState(true);
      handleKeyboardOpenState(false);
      expect(isKeyboardOpen.value).toBe(false);
    });
  });

  describe("virtualKeyboardLayouts", () => {
    it("returns null when layouts is null", () => {
      const { virtualKeyboardLayouts } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        ref(""),
        ref(null),
      );
      expect(virtualKeyboardLayouts.value).toBeNull();
    });

    it("returns the layouts object when provided", () => {
      const layouts = { English: { default: ["a b c"], shift: ["A B C"] } };
      const { virtualKeyboardLayouts } = useMetadataVirtualKeyboard(
        ref(InputFieldTypes.Text),
        ref(""),
        ref(layouts),
      );
      expect(virtualKeyboardLayouts.value).toEqual(layouts);
    });
  });
});
