import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "prosemirror-state";
import type { Ref } from "vue";
import type { ResolvedTagConfiguration } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";

export type InlineSuggestionState = {
  /**
   * Every configuration that declares this trigger character. Usually one; vlacc puts
   * `user` and `group` on `@` so one dropdown lists people and groups together.
   */
  configurations: ResolvedTagConfiguration[];
  query: string;
  range: { from: number; to: number };
  /** Viewport coordinates of the trigger, for anchoring the dropdown. */
  anchor: { left: number; bottom: number };
} | null;

/** The configurations sharing each trigger character, keyed by that character. */
export const configurationsByTrigger = (
  configurations: ResolvedTagConfiguration[],
): Map<string, ResolvedTagConfiguration[]> => {
  const byTrigger = new Map<string, ResolvedTagConfiguration[]>();
  for (const configuration of configurations) {
    const character = configuration.inlineTrigger?.character;
    if (!character) continue;
    byTrigger.set(character, [...(byTrigger.get(character) ?? []), configuration]);
  }
  return byTrigger;
};

/**
 * The configuration a picked entity was listed by, so the inserted node carries that
 * entry's tag element and its relation type ends up on the comment.
 *
 * Falls back to the first: a BaseEntity configuration matches no single type by design.
 */
export const configurationForEntity = (
  configurations: ResolvedTagConfiguration[],
  entity: { type?: string },
): ResolvedTagConfiguration | undefined =>
  configurations.find(
    (configuration) => configuration.taggableEntityType === entity?.type,
  ) ?? configurations[0];

export const suggestionStateFor = (
  configurations: ResolvedTagConfiguration[],
  props: any,
): InlineSuggestionState => {
  // The most permissive minimum wins: an entry that wants to list from one character
  // must not be held back by a sibling sharing its trigger.
  const minimum = Math.min(
    ...configurations.map(
      (configuration) => configuration.inlineTrigger?.minCharacters ?? 1,
    ),
  );
  if (props.query.length < minimum) return null;
  const coords = props.editor.view.coordsAtPos(props.range.to);
  return {
    configurations,
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
  // One plugin per trigger CHARACTER, not per configuration: Suggestion passes
  // pluginKey straight to `new Plugin({ key })`, so two configurations sharing `@`
  // would register the same key twice and ProseMirror throws "Adding different
  // instances of a keyed plugin". They share a dropdown instead.
  const byTrigger = configurationsByTrigger(configurations);
  if (!byTrigger.size) return undefined;

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

      return [...byTrigger.entries()]
        .map(([character, triggerConfigurations]) =>
          Suggestion({
            editor,
            pluginKey: new PluginKey(`suggestion-${character}`),
            char: character,
            allowSpaces: true,
            startOfLine: false,
            items: () => [],
            render: () => ({
              onStart: (props: any) => {
                suggestionState.value = suggestionStateFor(
                  triggerConfigurations,
                  props,
                );
              },
              onUpdate: (props: any) => {
                suggestionState.value = suggestionStateFor(
                  triggerConfigurations,
                  props,
                );
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
  const { configurations, range } = suggestionState;
  const configuration = configurationForEntity(configurations, entity);
  if (!configuration) return false;

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
