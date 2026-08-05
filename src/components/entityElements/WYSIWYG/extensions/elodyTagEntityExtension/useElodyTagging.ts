import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { Extension, Node } from "@tiptap/core";
import type { TaggableEntityConfiguration } from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import {
  applyColorStylingFromConfigurationToEditor,
  buildTaggingExtensions,
  resolveConfigurationForEntity,
  resolveTaggingConfigurations,
  type ResolvedTagConfiguration,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import {
  applyInlineTag,
  createInlineTagSuggestionExtension,
  type InlineSuggestionState,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/inlineTagSuggestion";

export type ElodyTaggingInstance = {
  /** Extensions for exactly ONE editor. Pass straight into `new Editor({extensions})`. */
  extensions: (Node<any, any> | Extension<any, any>)[];
  configuration: Ref<ResolvedTagConfiguration[]>;
  configurationsByEntity: Ref<TaggableEntityConfiguration[]>;
  isInNeedOfConfigurationEntities: ComputedRef<boolean>;
  getConfigurationForEntity: (
    entity: InBulkProcessableItem | { type: string },
  ) => ResolvedTagConfiguration | undefined;
  /** Inline `@` / `#` dropdown state; null when no trigger is active. */
  inlineSuggestion: Ref<InlineSuggestionState>;
  /** Inserts the picked entity over the active trigger range, consuming the character. */
  applyInlineSuggestion: (
    editor: any,
    entity: { id: string; [key: string]: any },
    label: string,
  ) => boolean;
  /** Removes this instance's injected <style>. MUST be called on unmount. */
  destroy: () => void;
};

/**
 * Owns the tagging configuration, extensions and injected styling for ONE WYSIWYG
 * editor.
 *
 * This replaces module-level state that made the extension unusable more than once
 * per page: a second editor overwrote the first one's configuration, node type
 * names drifted (`word` -> `word-2` -> `word-3`) across remounts, and every
 * initialisation leaked a `<style>` element into `document.head`.
 *
 * @param instanceId Stable across remounts — scopes the injected CSS and identifies
 *   which editor opened the shared tagging modal. Callers pass something derived
 *   from their own identity (e.g. `${formId}-${metadataKey}`), never a counter.
 */
export const useElodyTagging = async (
  instanceId: string,
  taggableEntityConfiguration: TaggableEntityConfiguration[] | undefined,
): Promise<ElodyTaggingInstance> => {
  const configurationsByEntity = ref<TaggableEntityConfiguration[]>([]);
  const configuration = ref<ResolvedTagConfiguration[]>([]);

  configuration.value = await resolveTaggingConfigurations(
    taggableEntityConfiguration,
    configurationsByEntity,
  );

  const styleElement = applyColorStylingFromConfigurationToEditor(
    instanceId,
    configuration.value,
  );

  const inlineSuggestion = ref<InlineSuggestionState>(null);
  // Undefined when no configuration declares an inlineTrigger, or when
  // @tiptap/suggestion is not installed yet — either way the toolbar flow still works.
  const inlineSuggestionExtension = await createInlineTagSuggestionExtension(
    configuration.value,
    inlineSuggestion,
  );

  return {
    extensions: [
      ...buildTaggingExtensions({ instanceId, configuration }),
      ...(inlineSuggestionExtension ? [inlineSuggestionExtension] : []),
    ],
    configuration,
    configurationsByEntity,
    // Tagging needs configuration entities that this tenant has not created yet:
    // the toolbar button stays disabled and explains which type is missing.
    isInNeedOfConfigurationEntities: computed<boolean>(
      () =>
        !configuration.value.length && !!configurationsByEntity.value.length,
    ),
    getConfigurationForEntity: (entity) =>
      resolveConfigurationForEntity(configuration.value, entity),
    inlineSuggestion,
    applyInlineSuggestion: (editor, entity, label) => {
      const applied = applyInlineTag(
        editor,
        inlineSuggestion.value,
        entity,
        label,
      );
      inlineSuggestion.value = null;
      return applied;
    },
    // Returned rather than registered via onUnmounted: callers initialise inside an
    // async onMounted, and past the first `await` there is no active component
    // instance left for a lifecycle hook to attach to.
    destroy: () => {
      styleElement?.remove();
      inlineSuggestion.value = null;
    },
  };
};
