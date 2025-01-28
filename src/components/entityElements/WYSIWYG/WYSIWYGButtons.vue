<template>
  <div class="sticky top-0 transparent-bg z-[100] flex flex-wrap px-2">
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().setParagraph().run()"
      :class="{ 'is-active': editor.isActive('paragraph') }"
      title="Paragraph"
    >
      Paragraph
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      title="H1"
    >
      H1
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      title="H2"
    >
      H2
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      title="H3"
    >
      H3
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      s
      @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      title="H4"
    >
      H4
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      title="H5"
    >
      H5
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      title="H6"
    >
      H6
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleBulletList().run()"
      :class="{ 'is-active': editor.isActive('bulletList') }"
      title="Bullet list"
    >
      <unicon :name="Unicons.ListUl.name" />
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleOrderedList().run()"
      :class="{ 'is-active': editor.isActive('orderedList') }"
      title="Ordered list"
    >
      <unicon :name="Unicons.ListOl.name" />
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleCodeBlock().run()"
      :class="{ 'is-active': editor.isActive('codeBlock') }"
      title="Code block"
    >
      <unicon :name="Unicons.Arrow.name" />
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleBlockquote().run()"
      :class="{ 'is-active': editor.isActive('blockquote') }"
      title="Blockquote"
    >
      Blockquote
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().setHorizontalRule().run()"
      title="Horizontal rule"
    >
      <unicon :name="Unicons.Minus.name" />
    </button>
    <button
      v-if="extensions.includes(WysiwygExtensions.StarterKit)"
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().setHardBreak().run()"
      title="Hard break"
    >
      Hard break
    </button>
    <button
      v-if="
        extensions.includes(WysiwygExtensions.Bold) ||
        extensions.includes(WysiwygExtensions.StarterKit)
      "
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleBold().run()"
      :class="['font-mono', { 'is-active': editor.isActive('bold') }]"
      title="Bold"
    >
      <b>B</b>
    </button>
    <button
      v-if="
        extensions.includes(WysiwygExtensions.Italic) ||
        extensions.includes(WysiwygExtensions.StarterKit)
      "
      :disabled="buttonsDisabled"
      @click="editor.chain().focus().toggleItalic().run()"
      :class="['font-mono', { 'is-active': editor.isActive('italic') }]"
      title="Italic"
    >
      <i>I</i>
    </button>
    <button
      v-if="isTextSelected"
      :disabled="buttonsDisabled"
      @click="editor.commands.openTagModal()"
      title="Italic"
    >
      Tag
    </button>
  </div>
</template>

<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";
import { WysiwygExtensions } from "@/generated-types/queries";
import { Unicons } from "@/types";
import useEdit from "@/composables/useEdit";
import { computed } from "vue";

const props = defineProps<{
  editor: Editor;
  extensions: WysiwygExtensions[];
}>();

const { isEdit } = useEdit();
const buttonsDisabled = computed(() => !isEdit.value);
const isTextSelected = computed(() => {
  const { selection } = props.editor.state;
  return selection.from !== selection.to;
});
</script>

<style lang="scss" scoped>
button {
  padding: 0.5rem;
  margin: 0.25rem;
  background-color: theme("colors.neutral.40");
  border-radius: 0.25rem;
  min-width: 2rem;
}

.is-active {
  background-color: theme("colors.accent.normal");
  color: theme("colors.white");
}

.transparent-bg {
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
