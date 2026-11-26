<template>
  <div
    :class="[
      'sticky top-0 transparent-bg z-[19] flex flex-wrap',
      { 'px-2': !displayInline },
    ]"
  >
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
      v-for="configurationItem in flowConfigurations"
      :key="`tag-flow-${configurationItem.guidedFlowQuery}`"
      data-testid="wysiwyg-tag-flow-button"
      :class="{ 'opacity-30': isFlowDisabled(configurationItem) }"
      :disabled="buttonsDisabled || isFlowDisabled(configurationItem)"
      @click="editor.commands.openTagFlow(configurationItem)"
      :title="flowTitle(configurationItem)"
    >
      {{ t(labelForFlow(configurationItem)) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import {
  type TaggableEntityConfiguration,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useEditMode } from "@/composables/useEdit";
import { computed } from "vue";
import { hasSelectionBeenTagged } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import type { ElodyTaggingInstance } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/useElodyTagging";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  formId: string;
  editor: Editor;
  extensions: WysiwygExtensions[];
  displayInline: boolean;
  tagging?: ElodyTaggingInstance;
  // The field is edited in place (outside the page-wide edit mode).
  editing?: boolean;
}>();

const useEditHelper = useEditMode(props.formId);
const { t } = useI18n();

const buttonsDisabled = computed(
  () => !(useEditHelper.isEdit || props.editing),
);
const editorHasSelection = computed(() => {
  const { selection } = props.editor.state;
  return selection.from !== selection.to;
});
const isNonTaggedTextSelected = computed(() => {
  return !hasSelectionBeenTagged(props.editor);
});
const flowConfigurations = computed<TaggableEntityConfiguration[]>(
  () => props.tagging?.flowConfigurations.value ?? [],
);
const labelForFlow = (configurationItem: {
  guidedFlowButtonLabel?: string | null;
}): string => configurationItem.guidedFlowButtonLabel || "tagging.tag-via-flow";

const isInNeedOfConfigurationEntities = computed<boolean>(
  () => !!props.tagging?.isInNeedOfConfigurationEntities?.value,
);
// A flow that searches on the selection has nothing to search on without one
const isFlowDisabled = (
  configurationItem: TaggableEntityConfiguration,
): boolean => {
  if (isInNeedOfConfigurationEntities.value) return true;
  if (!configurationItem.metadataFilterForTagContent) return false;
  return !editorHasSelection.value || !isNonTaggedTextSelected.value;
};
const flowTitle = (configurationItem: TaggableEntityConfiguration): string =>
  isInNeedOfConfigurationEntities.value
    ? t("tagging.configuration-entity-required", {
        entityType: neededConfigurationEntityTypes.value,
      })
    : t(labelForFlow(configurationItem));
const neededConfigurationEntityTypes = computed<string>(() => {
  const configurationEntityTypes: string[] = (
    props.tagging?.configurationsByEntity?.value ?? []
  ).map(
    (configurationItem) =>
      configurationItem.tagConfigurationByEntity.configurationEntityType,
  );
  return configurationEntityTypes.join(" or ");
});
</script>

<style scoped>
button {
  padding: 0.25rem;
  margin: 0.25rem;
  background-color: var(--color-neutral-40);
  border-radius: 0.25rem;
  min-width: 2rem;
}

.is-active {
  background-color: var(--color-accent-normal);
  color: var(--color-white);
}

.transparent-bg {
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
}
</style>
