import { Node, Extension, type CommandProps } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState } from "prosemirror-state";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  AdvancedFilterTypes,
  type BaseEntity,
  Entitytyping,
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  ModalStyle,
  SearchInputType,
  type TaggableEntityConfiguration,
  TypeModals,
} from "@/generated-types/queries";
import { type Editor } from "@tiptap/vue-3";
import {
  BulkOperationsContextEnum,
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useFormHelper } from "@/composables/useFormHelper";
import { useDeleteRelations } from "@/composables/useDeleteRelations";
import useEntitySingle from "@/composables/useEntitySingle";
import { getEntityTitle, stripHighlightTags } from "@/helpers";
import type { Ref } from "vue";
import { apolloClient } from "@/main";
import { DOMSerializer } from "prosemirror-model";

const { addRelations } = useFormHelper();
const { deleteRelations } = useDeleteRelations();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

export type TaggableEntityConfigurationFromEntity =
  TaggableEntityConfiguration & {
    configurationEntityId: string;
    tagColor: string;
    attributes?: Record<string, string>;
    extensionName: string;
  };

export type ResolvedTagConfiguration =
  | TaggableEntityConfiguration
  | TaggableEntityConfigurationFromEntity;

export type TaggingContext = {
  instanceId: string;
  configuration: Ref<ResolvedTagConfiguration[]>;
};

export const TAG_GROUP = "elodyTag";

export const isTagNode = (node: {
  type: { isInGroup?: (group: string) => boolean };
}): boolean => !!node?.type?.isInGroup?.(TAG_GROUP);

export const resolveTaggingConfigurations = async (
  taggableEntityConfiguration: TaggableEntityConfiguration[] | undefined,
  configurationsByEntity: Ref<TaggableEntityConfiguration[]>,
): Promise<ResolvedTagConfiguration[]> => {
  const configurations = taggableEntityConfiguration ?? [];
  const configurationsWithTag = configurations.filter(
    (configurationItem: TaggableEntityConfiguration) => configurationItem.tag,
  );
  const configurationsFromEntities = await getPluginsFromConfigurationEntities(
    configurations,
    configurationsByEntity,
  );

  return [...configurationsWithTag, ...configurationsFromEntities];
};

export const buildTaggingExtensions = (
  context: TaggingContext,
): (Node<any, any> | Extension<any, any>)[] => [
  ...context.configuration.value
    .filter((configurationItem) => configurationItem.tag)
    .map((configurationItem) => createTipTapNodeExtension(configurationItem)),
  createTaggingCommandsExtension(context),
];

const generateExtensionNameFromConfiguration = (
  configurationItem: TaggableEntityConfigurationFromEntity,
): string => {
  const tag = configurationItem.tag === "?" ? "unknown" : configurationItem.tag;
  const name = tag || "tag";
  return configurationItem.configurationEntityId
    ? `${name}-${configurationItem.configurationEntityId}`
    : name;
};

// When the browser resolves a click after a contenteditable=false atom (tag), it may
// land at the atom's own start position instead of the position after it. This helper
// advances `from` past such a leading tag so adjacent-tag selections work correctly.
export const getAdjustedSelectionFrom = (state: EditorState): number => {
  const { from, to } = state.selection;
  let adjusted = from;
  state.doc.nodesBetween(from, from + 1, (node, pos) => {
    if (isTagNode(node) && pos === from && from + node.nodeSize < to) {
      adjusted = from + node.nodeSize;
    }
  });
  return adjusted;
};

const getNodeFromSelection = (
  state: EditorState,
): false | { node: Node; pos: number } => {
  const { selection, doc } = state;
  const { empty, anchor } = selection;

  if (!empty) {
    return false;
  }

  let foundNode: Node | null = null;
  let foundPos: number | null = null;

  doc.nodesBetween(anchor - 1, anchor, (n, p) => {
    foundNode = n;
    foundPos = p;
  });

  return foundNode && foundPos !== null
    ? { node: foundNode, pos: foundPos }
    : false;
};

const getSelectionHTML = (state: EditorState): string => {
  const from = getAdjustedSelectionFrom(state);
  const { to } = state.selection;

  if (from === to) {
    return "";
  }

  const slice = state.doc.cut(from, to);

  const serializer = DOMSerializer.fromSchema(state.schema);
  const container = document.createElement("div");

  container.appendChild(serializer.serializeFragment(slice.content));

  return Array.from(container.childNodes)
    .map((node) =>
      node instanceof HTMLElement ? node.innerHTML : node.textContent || "",
    )
    .join("");
};

export const createTipTapNodeExtension = (
  extensionConfiguration: TaggableEntityConfiguration,
) => {
  const additionalAttributes = [
    ...(extensionConfiguration.tagConfigurationByEntity
      ?.metadataKeysToSetAsAttribute ?? []),
    ...(extensionConfiguration.metadataKeysToSetAsAttribute ?? []),
  ];

  const extensionName = generateExtensionNameFromConfiguration(
    extensionConfiguration as TaggableEntityConfigurationFromEntity,
  );
  extensionConfiguration.extensionName = extensionName;

  return Node.create({
    name: extensionName,
    group: `inline ${TAG_GROUP}`,
    inline: true,
    selectable: false,
    atom: true,
    addAttributes() {
      const attributes: { [key: string]: any } = {
        entityId: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-entity-id"),
          renderHTML: (attributes: { [key: string]: string }) => {
            if (!attributes.entityId) {
              return {};
            }

            return {
              "data-entity-id": attributes.entityId,
            };
          },
        },
        label: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-label"),
          renderHTML: (attributes: { [key: string]: string }) => {
            if (!attributes.label) {
              return {};
            }

            return {
              "data-label": attributes.label,
            };
          },
        },
        entityType: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-entity-type"),
          renderHTML: (attributes: { [key: string]: string }) => {
            if (!attributes.entityType) {
              return {};
            }

            return {
              "data-entity-type": attributes.entityType,
            };
          },
        },
        taggedText: {
          default: "",
          parseHTML: (element: HTMLElement) => element.textContent || "",
          renderHTML: () => ({}),
        },
      };

      if (additionalAttributes) {
        additionalAttributes.forEach((attribute: string) => {
          attributes[attribute] = {
            [attribute]: {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.getAttribute(`data-${attribute}`),
              renderHTML: (attributes: { [key: string]: string }) => {
                if (!attributes[attribute]) {
                  return {};
                }

                return {
                  [`data-${attribute}`]: attributes[attribute],
                };
              },
            },
          };
        });
      }

      return attributes;
    },
    parseHTML() {
      return [
        {
          tag: "elody-" + extensionConfiguration.tag,
          getAttrs: (element) => {
            const attributes: { [key: string]: any } = {
              entityId: element.getAttribute("data-entity-id"),
              label: element.getAttribute("data-label"),
              entityType: element.getAttribute("data-entity-type"),
              taggedText: element.textContent || "",
            };

            if (additionalAttributes) {
              additionalAttributes.forEach((attribute) => {
                attributes[attribute] = {
                  [attribute]: element.getAttribute(`data-${attribute}`),
                };
              });
            }

            return attributes;
          },
        },
      ];
    },
    renderHTML({ HTMLAttributes, node }) {
      return [
        "elody-" + extensionConfiguration.tag,
        {
          ...HTMLAttributes,
          contenteditable: "false",
        },
        node.attrs.taggedText || "",
      ];
    },
  });
};

// Works around browsers failing to place a caret after a contenteditable="false"
// atom when it's the last DOM node in its textblock.
const invisibleCursorAnchorCharacter = "​";

const createTrailingSpacePlugin = () =>
  new Plugin({
    key: new PluginKey("elodyTagTrailingSpace"),
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((transaction) => transaction.docChanged)) {
        return null;
      }

      const { tr } = newState;
      const insertionPositions: number[] = [];

      newState.doc.descendants((node, pos) => {
        if (!node.isTextblock || node.childCount === 0) return true;
        const lastChild = node.lastChild;
        if (lastChild && isTagNode(lastChild)) {
          insertionPositions.push(pos + node.nodeSize - 1);
        }
        return true;
      });

      if (!insertionPositions.length) return null;

      insertionPositions
        .sort((a, b) => b - a)
        .forEach((pos) => tr.insertText(invisibleCursorAnchorCharacter, pos));

      return tr;
    },
  });

export const buildTagAttributes = (
  configurationItem: TaggableEntityConfigurationFromEntity,
  entity: InBulkProcessableItem,
): { [key: string]: string } => {
  const attributes: { [key: string]: string } = {};
  if (configurationItem.attributes)
    Object.assign(attributes, configurationItem.attributes);
  configurationItem.metadataKeysToSetAsAttribute?.forEach((key) => {
    let value = "";
    if (entity.intialValues) value = entity.intialValues[key] as string;
    if (entity.teaserMetadata)
      value = (entity.teaserMetadata as any).find(
        (metadataItem: any) => metadataItem.key === key,
      )?.value;
    Object.assign(attributes, { [key]: stripHighlightTags(value) });
  });
  return attributes;
};

export const createTaggingCommandsExtension = (context: TaggingContext) =>
  Extension.create({
    name: "elodyTaggingCommands",
    addProseMirrorPlugins() {
      return [createTrailingSpacePlugin()];
    },
    addCommands() {
      return {
        openTagModal:
          () =>
          ({ state, editor }: CommandProps) => {
            const selectedText = getSelectionHTML(state);

            const { openModal } = useBaseModal();
            openModal(
              TypeModals.ElodyEntityTaggingModal,
              ModalStyle.Center,
              undefined,
              undefined,
              false,
              undefined,
              { selectedText, editor, editorId: context.instanceId },
            );
          },
        openTagFlow:
          (configurationItem: ResolvedTagConfiguration) =>
          ({ editor }: CommandProps) => {
            if (!configurationItem?.guidedFlowQuery) return false;

            const { openModal } = useBaseModal();
            openModal(
              TypeModals.GuidedFlow,
              ModalStyle.CenterWide,
              configurationItem.guidedFlowQuery,
              undefined,
              false,
              undefined,
              {
                editorId: context.instanceId,
                onEntitySelected: (entity: InBulkProcessableItem) =>
                  editor.commands.tagEntityFromFlow(entity, configurationItem),
              },
            );
            return true;
          },
        tagEntityFromFlow:
          (
            entity: InBulkProcessableItem,
            configurationItem: ResolvedTagConfiguration,
          ) =>
          ({ commands, state }: { commands: any; state: EditorState }) => {
            if (!entity || !configurationItem?.tag) return false;

            const { to } = state.selection;
            const from = getAdjustedSelectionFrom(state);
            const taggedText =
              from === to
                ? stripHighlightTags(getEntityTitle(entity as any))
                : state.doc.textBetween(from, to);

            return commands.insertContentAt(
              { from, to },
              {
                type: (
                  configurationItem as TaggableEntityConfigurationFromEntity
                ).extensionName,
                attrs: {
                  entityId: entity.id,
                  taggedText,
                  label: taggedText,
                  entityType: entity.type ?? null,
                  ...buildTagAttributes(
                    configurationItem as TaggableEntityConfigurationFromEntity,
                    entity,
                  ),
                },
              },
            );
          },
        tagAndLinkEntity:
          (entity: InBulkProcessableItem, parentEntityId: string) =>
          ({ commands }: CommandProps) => {
            const configurationItem = resolveConfigurationForEntity(
              context.configuration.value,
              entity,
            );
            if (!configurationItem) return false;

            tagEntity(
              entity,
              configurationItem.relationType,
              parentEntityId,
              BulkOperationsContextEnum.TagEntityModal,
            );
            return commands.linkEntityToTaggedText(entity);
          },
        linkEntityToTaggedText:
          (entity: InBulkProcessableItem) =>
          async ({
            commands,
            state,
          }: {
            commands: any;
            state: EditorState;
          }) => {
            const configurationItem:
              | TaggableEntityConfigurationFromEntity
              | undefined = resolveConfigurationForEntity(
              context.configuration.value,
              entity,
            ) as TaggableEntityConfigurationFromEntity | undefined;
            const additionalAttributes: { [key: string]: string } = {};

            if (!entity) throw Error("Error tagging text: no entity to tag");
            if (!configurationItem || !configurationItem.tag)
              throw Error(
                "Error tagging text: config should contain 'tag' or should have received the 'tag' property from its 'tagConfigurationByEntity' block",
              );

            Object.assign(
              additionalAttributes,
              buildTagAttributes(configurationItem, entity),
            );

            const { selection } = state;
            const { to } = selection;
            const from = getAdjustedSelectionFrom(state);
            const taggedText = state.doc.textBetween(from, to);

            const newNodeContent = {
              type: configurationItem.extensionName,
              attrs: {
                entityId: entity.id,
                taggedText,
                ...additionalAttributes,
              },
            };

            Object.assign(newNodeContent.attrs, additionalAttributes);
            commands.deleteRange({ from, to });
            commands.insertContentAt(from, newNodeContent);
            commands.setTextSelection(from + 1);

            useBaseModal().closeModal(TypeModals.ElodyEntityTaggingModal);
          },
        untagSelectedText:
          () =>
          async ({
            editor,
            state,
            commands,
          }: {
            editor: Editor;
            state: EditorState;
            commands: any;
          }) => {
            const { selection } = state;
            const { from, to } = selection;

            if (selection.empty) {
              throw new Error("No node selected to untag");
            }

            let taggedNode: any = null;
            let taggedPos: number | null = null;

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (isTagNode(node)) {
                taggedNode = node;
                taggedPos = pos;
                return false;
              }
            });

            if (!taggedNode || taggedPos === null) {
              throw new Error("No tagged node found in selection");
            }

            const taggedText = taggedNode.attrs.taggedText || "";
            const entityId = taggedNode.attrs.entityId;
            const nodeEnd = taggedPos + taggedNode.nodeSize;

            commands.deleteRange({ from: taggedPos, to: nodeEnd });
            commands.insertContentAt(taggedPos, {
              type: "text",
              text: taggedText,
            });
            commands.setTextSelection(taggedPos + taggedText.length);

            const entityExtensionConfiguration =
              context.configuration.value.find(
                (mappingItem: ResolvedTagConfiguration) =>
                  mappingItem.extensionName === taggedNode.type.name,
              );

            if (entityExtensionConfiguration) {
              deleteRelations(
                entityId,
                entityExtensionConfiguration.relationType,
                [{ key: entityId }],
                BulkOperationsContextEnum.TagEntityModal,
                false,
              );
            }
          },
      };
    },
    addKeyboardShortcuts() {
      return {
        Backspace: () =>
          this.editor.commands.command(
            ({ tr, state }: CommandProps): boolean => {
              const { node, pos } = getNodeFromSelection(state);
              const { getEntityUuid } = useEntitySingle();
              const entityId = getEntityUuid();

              if (!node || !pos || !entityId) {
                return false;
              }

              const entityExtensionConfiguration =
                context.configuration.value.find(
                  (mappingItem: ResolvedTagConfiguration) =>
                    mappingItem.extensionName === node.type.name,
                );
              if (entityExtensionConfiguration) {
                tr.insertText("", pos, pos + node.nodeSize);
                deleteRelations(
                  entityId,
                  entityExtensionConfiguration.relationType,
                  [{ key: node.attrs.entityId }],
                  BulkOperationsContextEnum.TagEntityModal,
                  false,
                );
                return true;
              }
              return false;
            },
          ),
      };
    },
  });

const createConfigurationItemsFromMapping = (
  configurationItemEntitiesMapping: {
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }[],
): TaggableEntityConfigurationFromEntity[] => {
  const configurations: TaggableEntityConfigurationFromEntity[] = [];
  configurationItemEntitiesMapping.forEach((mappingItem) => {
    const config = mappingItem.configurationEntities.map(
      (configurationEntity: BaseEntity) => {
        return {
          createNewEntityFormQuery:
            mappingItem.configurationItem.createNewEntityFormQuery,
          metadataFilterForTagContent:
            mappingItem.configurationItem.metadataFilterForTagContent,
          metadataKeysToSetAsAttribute:
            mappingItem.configurationItem.metadataKeysToSetAsAttribute,
          relationType: mappingItem.configurationItem.relationType,
          tag: configurationEntity.intialValues[
            mappingItem.configurationItem.tagConfigurationByEntity
              ?.tagMetadataKey
          ],
          configurationEntityId: configurationEntity.id,
          tagColor:
            configurationEntity.intialValues[
              mappingItem.configurationItem.tagConfigurationByEntity
                ?.colorMetadataKey
            ].label,
          attributes:
            mappingItem.configurationItem.tagConfigurationByEntity?.metadataKeysToSetAsAttribute?.reduce(
              (o, key) => ({
                ...o,
                [key]: configurationEntity.intialValues[key],
              }),
              {},
            ),
          tagConfigurationByEntity:
            mappingItem.configurationItem.tagConfigurationByEntity,
          taggableEntityType: mappingItem.configurationItem.taggableEntityType,
        };
      },
    );
    configurations.push(...config);
  });
  return configurations;
};

const getConfigurationEntities = async (
  configurations: TaggableEntityConfiguration[],
  configurationsByEntity: Ref<TaggableEntityConfiguration[]>,
) => {
  configurationsByEntity.value = configurations.filter(
    (configurationItem) => configurationItem.tagConfigurationByEntity,
  );
  if (!configurationsByEntity.value.length) return;

  const query = GetEntitiesDocument;

  const configurationItemEntitiesMappingPromises: Promise<{
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }>[] = configurationsByEntity.value.map(async (configurationItem) => {
    const queryVariables: GetEntitiesQueryVariables = {
      advancedFilterInputs: {
        match_exact: true,
        type: AdvancedFilterTypes.Type,
        value:
          configurationItem.tagConfigurationByEntity?.configurationEntityType,
      },
      searchInputType: SearchInputType.AdvancedInputType,
      searchValue: {
        isAsc: true,
      },
      type: Entitytyping.BaseEntity,
      limit: 100,
      skip: 1,
    };

    const response = await apolloClient.query({
      query,
      variables: queryVariables,
      fetchPolicy: "no-cache",
    });

    const configurationEntities: BaseEntity[] = response.data.Entities.results;

    return {
      configurationItem,
      configurationEntities,
    };
  });

  const configurationItemEntitiesMapping: {
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }[] = await Promise.all(configurationItemEntitiesMappingPromises);

  return createConfigurationItemsFromMapping(configurationItemEntitiesMapping);
};

export const applyColorStylingFromConfigurationToEditor = (
  instanceId: string,
  configurations: ResolvedTagConfiguration[] | undefined,
): HTMLStyleElement | undefined => {
  const configurationItems = (configurations ??
    []) as TaggableEntityConfigurationFromEntity[];
  if (!configurationItems.length) return undefined;

  const styleElementId = `elody-tagging-${instanceId}`;
  document.getElementById(styleElementId)?.remove();

  const style = document.createElement("style");
  style.id = styleElementId;
  configurationItems.forEach(
    (configurationItem: TaggableEntityConfigurationFromEntity) => {
      const styleDefiningAttribute: string | undefined =
        configurationItem.tagConfigurationByEntity
          ?.secondaryAttributeToDetermineTagConfig;
      const attributeSelector = styleDefiningAttribute
        ? `[${styleDefiningAttribute}="${configurationItem.attributes?.[styleDefiningAttribute]}"]`
        : "";
      const horizontalPadding =
        configurationItem.inlineTrigger?.character ||
        configurationItem.guidedFlowQuery
          ? "0.25rem"
          : "0";
      const appearance = configurationItem.tagColor
        ? `background-color: ${configurationItem.tagColor};
           color: #fff;`
        : `background-color: var(--color-accent-light);
           color: var(--color-text-body);
           box-shadow: inset 0 0 0 1px var(--color-accent-accent);
           font-weight: 500;`;
      style.textContent += `
      [data-wysiwyg-id="${instanceId}"] elody-${configurationItem.tag}${attributeSelector} {
        ${appearance}
        padding: 0.125rem ${horizontalPadding};
        border-radius: 0.25rem;
        margin: 0;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        caret-color: transparent;
      }
      `;
    },
  );
  document.head.appendChild(style);
  return style;
};

export const getPluginsFromConfigurationEntities = async (
  configurations: TaggableEntityConfiguration[],
  configurationsByEntity: Ref<TaggableEntityConfiguration[]>,
): Promise<TaggableEntityConfigurationFromEntity[]> => {
  const configurationEntities:
    | TaggableEntityConfigurationFromEntity[]
    | undefined = await getConfigurationEntities(
    configurations,
    configurationsByEntity,
  );
  return configurationEntities ?? [];
};

export const resolveConfigurationForEntity = (
  configurations: ResolvedTagConfiguration[],
  entity: InBulkProcessableItem | { type: string },
): ResolvedTagConfiguration | undefined => {
  let configuration = undefined;

  if (!entity.relationValues)
    return configurations.find(
      (configurationItem) =>
        configurationItem.taggableEntityType === entity.type,
    );

  const configurationEntityIds: string[] = configurations.map(
    (configurationItem: ResolvedTagConfiguration) =>
      configurationItem.configurationEntityId,
  );

  const entityRelationValues = Object.values(entity.relationValues).map(
    (relationValue) => relationValue[0].key,
  );
  entityRelationValues.forEach((relationValue: any) => {
    if (configurationEntityIds.includes(relationValue))
      configuration = configurations.find(
        (configurationItem) =>
          configurationItem.configurationEntityId === relationValue,
      );
  });

  return configuration;
};

export const hasSelectionBeenTagged = (editor: Editor) => {
  const { state } = editor;
  const { selection } = state;

  if (selection.empty) return false;

  const from = getAdjustedSelectionFrom(state);
  const { to } = selection;
  let isTagged = false;

  state.doc.nodesBetween(from, to, (node) => {
    if (isTagNode(node)) {
      isTagged = true;
      return false;
    }
  });

  return isTagged;
};

export const tagEntity = (
  entityToTag: InBulkProcessableItem,
  relationType: string,
  parentEntityId: string,
  context: Context,
) => {
  addRelations([entityToTag], relationType, parentEntityId, true);
  dequeueAllItemsForBulkProcessing(context);
};

export const openDetailModal = (
  node: any,
  configurations: ResolvedTagConfiguration[],
) => {
  const entityId = node.attrs.entityId;
  const entityType =
    node.attrs.entityType ??
    configurations.find(
      (configurationItem) => configurationItem.extensionName === node.type.name,
    )?.taggableEntityType;
  if (!entityType)
    throw Error(`Tagging configuration for '${node.type.name}' not found`);
  useBaseModal().openModal(
    TypeModals.EntityDetailModal,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    { entityId, entityType },
  );
};
