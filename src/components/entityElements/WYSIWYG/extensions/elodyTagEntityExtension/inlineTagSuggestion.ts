import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "prosemirror-state";
import type { Ref } from "vue";
import type { ResolvedTagConfiguration } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";

/** Open dropdown state for one editor. `null` means no trigger is active. */
export type InlineSuggestionState = {
  configuration: ResolvedTagConfiguration;
  query: string;
  range: { from: number; to: number };
  /** Viewport coordinates of the trigger, for anchoring the dropdown. */
  anchor: { left: number; bottom: number };
} | null;

/**
 * Inline `@` / `#` tagging.
 *
 * A configuration that declares an `inlineTrigger` is tagged by typing its trigger
 * character; one without keeps the existing select-text-then-Tag-button flow. The mode
 * is therefore DERIVED from configuration and never configured twice.
 *
 * Two properties matter and are load-bearing:
 *
 *  1. The trigger character is CONSUMED. @tiptap/suggestion reports a range that
 *     includes the character, and the insertion replaces that whole range, so it never
 *     survives as document text. AICAP tags Arabic text and must never see an `@`;
 *     because AICAP declares no inlineTrigger it never enters this path at all, and
 *     even if it did the character could not reach getHTML(). If a client wants the
 *     character shown, that is CSS (`elody-user::before`), not document content.
 *
 *  2. This path does NOT write relations. The older toolbar flow calls `tagEntity`,
 *     which writes onto `route.params.id`'s form — tagging a user inside a comment
 *     composer would put the relation on the Work. Here the node is inserted and
 *     nothing else; the caller reads the tags back off the composed HTML
 *     (`extractTaggedRelations`) when it submits.
 *
 * Note this cannot replace the toolbar flow: @tiptap/suggestion only fires at a word
 * boundary, so it is structurally incapable of AICAP's mid-word partial tagging.
 */
/**
 * Anchors the dropdown on the trigger's own screen position.
 *
 * Deliberately NOT @tiptap/suggestion's `props.clientRect`: that resolves by querying
 * `view.dom` for the decoration span, so it hands back null whenever the decoration is
 * not in the DOM at that instant — and a null rect meant the dropdown had no position
 * and silently never rendered, even though the search request had already fired.
 * coordsAtPos asks the view directly and cannot fail that way.
 */
const openState = (
  configuration: ResolvedTagConfiguration,
  props: any,
): InlineSuggestionState => {
  const coords = props.editor.view.coordsAtPos(props.range.to);
  return {
    configuration,
    query: props.query,
    range: props.range,
    anchor: { left: coords.left, bottom: coords.bottom },
  };
};

/**
 * Whether typing a trigger character is the ONLY way to tag in this editor.
 *
 * The toolbar button opens TagEntityModal, which is a different flow with different
 * behaviour (it can create a new entity, and it tags whatever text is selected). Where
 * every configuration declares a trigger, that button is a second, inconsistent route to
 * the same feature, so the host hides it.
 *
 * Deliberately ALL and not SOME: a configuration set can mix the two (AICAP declares no
 * trigger at all, and its researchers tag sub-strings of a word, which a trigger
 * structurally cannot do). Hiding the button as soon as one entry has a trigger would
 * strand every entry that has none.
 */
export const isTaggedByTriggerOnly = (
  configurations: ResolvedTagConfiguration[],
): boolean =>
  configurations.length > 0 &&
  configurations.every(
    (configuration) => !!configuration.inlineTrigger?.character,
  );

export const createInlineTagSuggestionExtension = async (
  configurations: ResolvedTagConfiguration[],
  suggestionState: Ref<InlineSuggestionState>,
): Promise<Extension | undefined> => {
  const inlineConfigurations = configurations.filter(
    (configuration) => configuration.inlineTrigger?.character,
  );
  if (!inlineConfigurations.length) return undefined;

  return Extension.create({
    name: "elodyInlineTagSuggestion",
    addProseMirrorPlugins() {
      const editor = this.editor;

      /**
       * Closes the dropdown when the editor loses focus.
       *
       * @tiptap/suggestion only exits on document changes, so nothing else clears the
       * state when the editor stops being the thing the user is looking at. Closing the
       * comment modal is the case that exposed it: the dialog only flips its `open`
       * flag, so the composer stays mounted with an open suggestion — and since the
       * dropdown is a top-layer popover, it went on floating over the page after the
       * dialog beneath it was gone.
       *
       * Lives here, not in the host component, so every editor that loads this
       * extension is covered. Picking an option cannot trip it: those handlers
       * preventDefault on mousedown, so focus never leaves the editor.
       */
      const closeOnBlur = new Plugin({
        props: {
          handleDOMEvents: {
            blur: () => {
              suggestionState.value = null;
              return false; // Never consume: other extensions handle blur too.
            },
          },
        },
      });

      return inlineConfigurations
        .map((configuration) =>
          Suggestion({
            editor,
            // One PluginKey per trigger. Suggestion passes `pluginKey` straight to
            // `new Plugin({ key })`, and its default is a single shared key, so two
            // configurations with a trigger (vlacc has `@` and `#`) would both register
            // `suggestion$` and ProseMirror throws "Adding different instances of a
            // keyed plugin".
            //
            // Keyed on the trigger character, NOT extensionName: that field is only
            // assigned when the node extensions are built, which happens after this, so
            // every key came out as `suggestion-undefined`. The character is unique by
            // definition — two configurations sharing one would be ambiguous anyway.
            pluginKey: new PluginKey(
              `suggestion-${configuration.inlineTrigger!.character}`,
            ),
            char: configuration.inlineTrigger!.character,
            // Tag content is a title or a person's name, so spaces have to be allowed.
            allowSpaces: true,
            startOfLine: false,
            items: ({ query }: { query: string }) => {
              const minimum = configuration.inlineTrigger!.minCharacters ?? 1;
              // The dropdown owns fetching; the plugin only reports what was typed.
              return query.length >= minimum ? [query] : [];
            },
            render: () => ({
              onStart: (props: any) => {
                suggestionState.value = openState(configuration, props);
              },
              onUpdate: (props: any) => {
                suggestionState.value = openState(configuration, props);
              },
              onKeyDown: (props: any) => {
                if (props.event.key !== "Escape") return false;
                suggestionState.value = null;
                return true;
              },
              onExit: () => {
                suggestionState.value = null;
              },
            }),
          }),
        )
        .concat(closeOnBlur);
    },
  });
};

/**
 * Inserts a tag node over the suggestion range, consuming the trigger character with
 * it. Deliberately reuses the same insertion path as the toolbar flow so both modes
 * produce identical HTML; only the range differs (selection vs. suggestion range).
 */
export const applyInlineTag = (
  editor: any,
  suggestionState: InlineSuggestionState,
  entity: { id: string; [key: string]: any },
  label: string,
): boolean => {
  if (!suggestionState || !editor) return false;
  const { configuration, range } = suggestionState;

  return editor
    .chain()
    .focus()
    .insertContentAt(range, {
      type: configuration.extensionName,
      attrs: {
        entityId: entity.id,
        taggedText: label,
        label,
        // From the picked entity, not the configuration: a configuration that tags any
        // type (vlacc's `#`) has no single type to fall back on.
        entityType: entity.type ?? null,
      },
    })
    .run();
};
