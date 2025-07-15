<template>
  <div>
    <BaseVirtualKeyboard
      :input="editor?.getText()"
      @onKeyPress="handleKeyPress"
      @isOpen="handleFocus"
      :keyboardClass="keyboardClass"
      :layouts="extraLayouts"
    />
  </div>
</template>

<script setup lang="ts">
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import type { Editor } from "@tiptap/vue-3";
import type { KeyboardLayouts } from "@/composables/useBaseVirtualKeyboard";

const props = defineProps<{
  editor: Editor;
  keyboardClass: string;
  extraLayouts: KeyboardLayouts;
}>();

function handleKeyPress(button: string) {
  if (!props.editor) return;

  const { editor } = props;

  const mapControlToSymbol: Record<string, string> = {
    "{enter}": "\n",
    "{space}": " ",
    "{tab}": "\t",
  };

  const getMappedSymbol = (btn: string) => {
    return mapControlToSymbol[btn] ?? btn;
  };

  if (button === "{bksp}") {
    editor
      .chain()
      .deleteSelection()
      .deleteRange({
        from: editor.state.selection.from - 1,
        to: editor.state.selection.from,
      })
      .run();
    forceFocus();
    return;
  }

  const registeredControls = Object.keys(mapControlToSymbol);
  if (
    !registeredControls.includes(button) &&
    button.startsWith("{") &&
    button.endsWith("}")
  )
    return;

  editor.chain().insertContent(getMappedSymbol(button)).run();

  forceFocus();
}

const handleFocus = (isOpen: boolean) => {
  if (!isOpen) return;
  props.editor.chain().focus("end").run();
};

const forceFocus = () => {
  setTimeout(() => {
    props.editor.chain().focus().run();
  }, 0);
};
</script>
