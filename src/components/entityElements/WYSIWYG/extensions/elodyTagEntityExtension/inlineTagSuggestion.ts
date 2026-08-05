import { Extension } from "@tiptap/core";
import type { Ref } from "vue";
import type { ResolvedTagConfiguration } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";

/** Open dropdown state for one editor. `null` means no trigger is active. */
export type InlineSuggestionState = {
  configuration: ResolvedTagConfiguration;
  query: string;
  range: { from: number; to: number };
  clientRect: DOMRect | null;
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
export const createInlineTagSuggestionExtension = async (
  configurations: ResolvedTagConfiguration[],
  suggestionState: Ref<InlineSuggestionState>,
): Promise<Extension | undefined> => {
  const inlineConfigurations = configurations.filter(
    (configuration) => configuration.inlineTrigger?.character,
  );
  if (!inlineConfigurations.length) return undefined;

  let Suggestion: any;
  try {
    // Imported through a variable specifier with @vite-ignore so the bundler does not
    // resolve it at transform time. package.json declares the dependency, but a
    // checkout that has not rebuilt its container yet does not have it on disk, and a
    // statically analysed import would fail the whole build rather than this feature.
    // Degrades to the toolbar Tag flow instead.
    const suggestionModule = "@tiptap/suggestion";
    Suggestion = (await import(/* @vite-ignore */ suggestionModule)).Suggestion;
  } catch {
    console.warn(
      "[elody-tagging] @tiptap/suggestion is not installed; inline @/# tagging is " +
        "disabled and the toolbar Tag flow is used instead. Run a client rebuild to " +
        "install it.",
    );
    return undefined;
  }

  return Extension.create({
    name: "elodyInlineTagSuggestion",
    addProseMirrorPlugins() {
      const editor = this.editor;

      return inlineConfigurations.map((configuration) =>
        Suggestion({
          editor,
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
              suggestionState.value = {
                configuration,
                query: props.query,
                range: props.range,
                clientRect: props.clientRect?.() ?? null,
              };
            },
            onUpdate: (props: any) => {
              suggestionState.value = {
                configuration,
                query: props.query,
                range: props.range,
                clientRect: props.clientRect?.() ?? null,
              };
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
      );
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
      attrs: { entityId: entity.id, taggedText: label, label },
    })
    .run();
};
