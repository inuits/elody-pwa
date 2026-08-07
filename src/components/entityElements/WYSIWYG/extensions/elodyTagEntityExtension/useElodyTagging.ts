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
  destroy: () => void;
};

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
    destroy: () => {
      styleElement?.remove();
      inlineSuggestion.value = null;
    },
  };
};
