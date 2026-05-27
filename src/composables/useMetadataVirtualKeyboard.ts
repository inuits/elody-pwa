// src/composables/useMetadataVirtualKeyboard.ts
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { InputFieldTypes } from "@/generated-types/queries";

export interface VirtualKeyboardContext {
  searchQuery: Ref<string>;
  isOpen: Ref<boolean>;
}

const DROPDOWN_FIELD_TYPES: InputFieldTypes[] = [
  InputFieldTypes.DropdownMultiselectRelations,
  InputFieldTypes.DropdownSingleselectRelations,
  InputFieldTypes.DropdownMultiselectMetadata,
  InputFieldTypes.DropdownSingleselectMetadata,
  InputFieldTypes.Dropdown,
];

export const useMetadataVirtualKeyboard = (
  fieldType: Ref<InputFieldTypes | undefined>,
  fieldValueProxy: Ref<any>,
  virtualKeyboardConfigLayouts: Ref<Record<string, any> | null>,
) => {
  const keyboardSearchQuery = ref<string>("");
  const isKeyboardOpen = ref<boolean>(false);

  const isDropdownField = computed(() =>
    DROPDOWN_FIELD_TYPES.includes(fieldType.value as InputFieldTypes),
  );

  const virtualKeyboardLayouts = computed(
    () => virtualKeyboardConfigLayouts.value,
  );

  const keyboardInput = computed<string>(() =>
    isDropdownField.value
      ? keyboardSearchQuery.value
      : String(fieldValueProxy.value ?? ""),
  );

  const handleKeyboardChange = (newStr: string) => {
    if (isDropdownField.value) {
      keyboardSearchQuery.value = newStr;
    } else {
      fieldValueProxy.value = newStr;
    }
  };

  const handleKeyboardOpenState = (open: boolean) => {
    isKeyboardOpen.value = open;
  };

  return {
    keyboardSearchQuery,
    isKeyboardOpen,
    isDropdownField,
    virtualKeyboardLayouts,
    keyboardInput,
    handleKeyboardChange,
    handleKeyboardOpenState,
  };
};
