import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "prosemirror-state";
import type { Ref } from "vue";
import type { ResolvedTagConfiguration } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";

export type InlineSuggestionState = {
  configuration: ResolvedTagConfiguration;
  query: string;
  range: { from: number; to: number };
  /** Viewport coordinates of the trigger, for anchoring the dropdown. */
  anchor: { left: number; bottom: number };
} | null;


export const suggestionStateFor = (
  configuration: ResolvedTagConfiguration,
  props: any,
): InlineSuggestionState => {
  if (props.query.length < (configuration.inlineTrigger?.minCharacters ?? 1))
    return null;
  const coords = props.editor.view.coordsAtPos(props.range.to);
  return {
    configuration,
    query: props.query,
    range: props.range,
    anchor: { left: coords.left, bottom: coords.bottom },
  };
};


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

      const closeOnBlur = new Plugin({
        props: {
          handleDOMEvents: {
            blur: () => {
              suggestionState.value = null;
              return false;
            },
          },
        },
      });

      return inlineConfigurations
        .map((configuration) =>
          Suggestion({
            editor,
            pluginKey: new PluginKey(
              `suggestion-${configuration.inlineTrigger!.character}`,
            ),
            char: configuration.inlineTrigger!.character,
            allowSpaces: true,
            startOfLine: false,
            items: () => [],
            render: () => ({
              onStart: (props: any) => {
                suggestionState.value = suggestionStateFor(configuration, props);
              },
              onUpdate: (props: any) => {
                suggestionState.value = suggestionStateFor(configuration, props);
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
