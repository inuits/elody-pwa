import { mergeAttributes, Node, Extension } from "@tiptap/core";
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
import { computed, ref } from "vue";
import { apolloClient } from "@/main";

const { addRelations } = useFormHelper();
const { deleteRelations } = useDeleteRelations();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

type TaggableEntityConfigurationFromEntity = TaggableEntityConfiguration & {
  configurationEntityId: string;
  tagColor: string;
  attributes?: Record<string, string>;
  extensionName: string;
};

export const extensionConfigurationsByEntity = ref<
  TaggableEntityConfiguration[]
>([]);

export const extensionConfiguration = ref<
  (TaggableEntityConfiguration | TaggableEntityConfigurationFromEntity)[]
>([]);

export const isInNeedOfConfigurationEntities = computed<boolean>(() => {
  if (!extensionConfiguration.value.length) {
    if (extensionConfigurationsByEntity.value.length) return true;
  }

  return false;
});

export const customExtensionNames = ref<string[]>([]);

export const initializeTaggingExtension: Promise<
  (Node<any, any> | Extension<any, any>)[]
> = async (taggableEntityConfiguration: TaggableEntityConfiguration[]) => {
  const initialExtensionConfigurationsWithTag =
    taggableEntityConfiguration.filter(
      (configurationItem: TaggableEntityConfiguration) => configurationItem.tag,
    );
  const extensionConfigurationsFromEntities: TaggableEntityConfiguration[] =
    await getPluginsFromConfigurationEntities(taggableEntityConfiguration);

  const usableExtensionConfigurations: TaggableEntityConfiguration[] = [
    ...initialExtensionConfigurationsWithTag,
    ...extensionConfigurationsFromEntities,
  ];

  setExtensionConfiguration(usableExtensionConfigurations);

  const extensionsFromEntities = extensionConfigurationsFromEntities.map(
    (configuration) => createTipTapNodeExtension(configuration),
  );
  const extensionConfigurationsWithTag = extensionConfiguration.value.filter(
    (item) => item.tag,
  );

  return [
    ...extensionConfigurationsWithTag.map((configurationItem) =>
      createTipTapNodeExtension(configurationItem),
    ),
    ...extensionsFromEntities,
    createGlobalCommandsExtension,
  ];
};

const generateExtensionNameFromConfiguration = (
  configurationItem: TaggableEntityConfigurationFromEntity,
): string => {
  let extensionName: string = configurationItem.tag || "";
  if (configurationItem.configurationEntityId) {
    extensionName += `-${configurationItem.configurationEntityId}`;
  }
  if (customExtensionNames.value.includes(extensionName)) {
    const occurrences: number = customExtensionNames.value.filter(
      (name: string) => name.includes(extensionName),
    ).length;
    extensionName += `-${occurrences + 1}`;
  }
  customExtensionNames.value.push(extensionName);
  return extensionName;
};

const getNodeFromSelection = (state) => {
  let node = undefined;
  let pos = undefined;
  const { selection } = state;
  const { empty, anchor } = selection;

  if (!empty) {
    return false;
  }

  state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
    node = node;
    pos = pos;
  });

  return { node, pos };
};

export const createTipTapNodeExtension = (
  extensionConfiguration: TaggableEntityConfiguration,
) => {
  const additionalAttributes = [
    ...extensionConfiguration.tagConfigurationByEntity
      ?.metadataKeysToSetAsAttribute,
    ...extensionConfiguration.metadataKeysToSetAsAttribute,
  ];

  const extensionName = generateExtensionNameFromConfiguration(
    extensionConfiguration as TaggableEntityConfigurationFromEntity,
  );
  extensionConfiguration.extensionName = extensionName;

  return Node.create({
    name: extensionName,
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,
    addAttributes() {
      const attributes = {
        entityId: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-entity-id"),
          renderHTML: (attributes) => {
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
          renderHTML: (attributes) => {
            if (!attributes.label) {
              return {};
            }

            return {
              "data-label": attributes.label,
            };
          },
        },
      };

      if (additionalAttributes) {
        additionalAttributes.forEach((attribute) => {
          attributes[attribute] = {
            [attribute]: {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.getAttribute(`data-${attribute}`),
              renderHTML: (attributes) => {
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
          tag: extensionConfiguration.tag,
          getAttrs: (element) => {
            const attributes = {
              entityId: element.getAttribute("data-entity-id"),
              label: element.getAttribute("data-label"),
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
    renderHTML({ node, HTMLAttributes }) {
      return [
        extensionConfiguration.tag,
        mergeAttributes(HTMLAttributes),
        node.attrs.label,
      ];
    },
  });
};

export const createGlobalCommandsExtension = Extension.create({
  addCommands() {
    return {
      openTagModal:
        () =>
        ({ state }) => {
          const { selection } = state;
          const { from, to } = selection;
          const selectedText = state.doc.textBetween(from, to, " ");

          const { openModal, updateModal } = useBaseModal();
          updateModal(TypeModals.ElodyEntityTaggingModal, { selectedText });
          openModal(TypeModals.ElodyEntityTaggingModal, ModalStyle.Center);
        },
      linkEntityToTaggedText:
        (
          entity: InBulkProcessableItem,
          relationType: string,
          newText: string | undefined,
        ) =>
        async ({ commands, state, view }) => {
          const configurationItem: TaggableEntityConfigurationFromEntity =
            getExtensionConfigurationForEntity(entity);
          const additionalAttributes = {};

          if (!entity) throw Error("Error tagging text: no entity to tag");
          if (!configurationItem.tag)
            throw Error(
              "Error tagging text: config should contain 'tag' or should have received the 'tag' property from its 'tagConfigurationByEntity' block",
            );

          if (configurationItem.attributes) {
            Object.assign(additionalAttributes, configurationItem.attributes);
          }
          if (configurationItem.metadataKeysToSetAsAttribute) {
            configurationItem.metadataKeysToSetAsAttribute.forEach(
              (key: string) => {
                let value = "";
                if (entity.intialValues) value = entity.intialValues[key];
                if (entity.teaserMetadata)
                  value = entity.teaserMetadata.find(
                    (metadataItem: any) => metadataItem.key === key,
                  )?.value;
                Object.assign(additionalAttributes, {
                  [key]: value,
                });
              },
            );
          }

          const { selection } = state;
          const { from, to } = selection;
          let selectedText = state.doc.textBetween(from, to, " ");

          if (newText && newText !== selectedText)
            selectedText = newText.toLowerCase();

          const newNodeContent = {
            type: configurationItem.extensionName,
            attrs: {
              label: selectedText,
              entityId: entity.id,
            },
          };

          Object.assign(newNodeContent.attrs, additionalAttributes);

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, newNodeContent);
          commands.selectNodeForward();

          view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
          useBaseModal().closeModal(TypeModals.ElodyEntityTaggingModal);
        },
      untagSelectedText:
        () =>
        async ({ editor, state }) => {
          const { selection, doc } = state;
          const { from, to } = selection;

          let selectedNode = null;
          let nodePos = null;

          doc.nodesBetween(from, to, (node, pos) => {
            if (node.attrs?.entityId) {
              selectedNode = node;
              nodePos = pos;
              return false;
            }
          });

          if (!selectedNode || nodePos === null) return;

          const nodeContent: string = selectedNode.attrs.label;
          const entityId = selectedNode.attrs.entityId;
          const insertEndPos = nodePos + nodeContent.length;

          editor
            .chain()
            .focus()
            .deleteRange({ from: nodePos, to: nodePos + selectedNode.nodeSize })
            .insertContentAt(nodePos, nodeContent)
            .setTextSelection(insertEndPos)
            .run();

          const entityExtensionConfiguration =
            extensionConfiguration.value.find(
              (mappingItem: TaggableEntityConfiguration) =>
                mappingItem.extensionName === selectedNode.type.name,
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
        this.editor.commands.command(({ tr, state }) => {
          const { node, pos } = getNodeFromSelection(state);
          const { getEntityUuid } = useEntitySingle();
          const entityId = getEntityUuid();

          if (!node || !pos || !entityId) {
            return false;
          }

          const entityExtensionConfiguration =
            extensionConfiguration.value.find(
              (mappingItem: TaggableEntityConfiguration) =>
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
          }
        }),
    };
  },
});

export const setExtensionConfiguration = (
  TaggableEntityConfiguration: TaggableEntityConfiguration[],
) => {
  extensionConfiguration.value = TaggableEntityConfiguration;
};

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
) => {
  extensionConfigurationsByEntity.value = configurations.filter(
    (configurationItem) => configurationItem.tagConfigurationByEntity,
  );
  if (!extensionConfigurationsByEntity.value.length) return;

  const query = GetEntitiesDocument;

  const configurationItemEntitiesMappingPromises: Promise<{
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }>[] = extensionConfigurationsByEntity.value.map(
    async (configurationItem) => {
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

      const configurationEntities: BaseEntity[] =
        response.data.Entities.results;

      return {
        configurationItem,
        configurationEntities,
      };
    },
  );

  const configurationItemEntitiesMapping: {
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }[] = await Promise.all(configurationItemEntitiesMappingPromises);

  return createConfigurationItemsFromMapping(configurationItemEntitiesMapping);
};

const applyColorStylingFromConfigurationToEditor = (
  configurations: TaggableEntityConfigurationFromEntity[],
) => {
  const style = document.createElement("style");
  configurations.forEach(
    (configurationItem: TaggableEntityConfigurationFromEntity) => {
      const styleDefiningAttribute: string =
        configurationItem.tagConfigurationByEntity
          .secondaryAttributeToDetermineTagConfig;
      style.textContent += `
      #wysiwyg-container ${configurationItem.tag}[${styleDefiningAttribute}="${configurationItem.attributes[styleDefiningAttribute]}"] {
        background-color: ${configurationItem.tagColor};
        color: #fff;
        border-radius: 0.375rem;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
        cursor: pointer;
      }
      
      #wysiwyg-container ${configurationItem.tag}[${styleDefiningAttribute}="${configurationItem.attributes[styleDefiningAttribute]}"]::after {
      content: "\\200B";
      }
      `;
    },
  );
  document.head.appendChild(style);
};

export const getPluginsFromConfigurationEntities = async (
  configurations: TaggableEntityConfiguration[],
): Promise<TaggableEntityConfiguration[]> => {
  const configurationEntities: TaggableEntityConfigurationFromEntity[] =
    await getConfigurationEntities(configurations);
  applyColorStylingFromConfigurationToEditor(configurationEntities);
  return configurationEntities;
};

export const getExtensionConfigurationForEntity = (
  entity: BaseEntity | { type: string },
): TaggableEntityConfigurationFromEntity | undefined => {
  let configuration = undefined;

  if (!entity.relationValues)
    return extensionConfiguration.value.find(
      (configurationItem) =>
        configurationItem.taggableEntityType === entity.type,
    );

  const configurationEntityIds: string[] = extensionConfiguration.value.map(
    (
      configurationItem:
        | TaggableEntityConfiguration
        | TaggableEntityConfigurationFromEntity,
    ) => configurationItem.configurationEntityId,
  );

  const entityRelationValues = Object.values(entity.relationValues).map(
    (relationValue) => relationValue[0].key,
  );
  entityRelationValues.forEach((relationValue: any) => {
    if (configurationEntityIds.includes(relationValue))
      configuration = extensionConfiguration.value.find(
        (configurationItem) =>
          configurationItem.configurationEntityId === relationValue,
      );
  });

  return configuration;
};

export const hasSelectionBeenTagged = (editor: Editor) => {
  const { state } = editor;
  const { $from } = state.selection;

  const nodeBefore = $from.nodeBefore;
  const nodeAfter = $from.nodeAfter;

  const isTagged =
    (nodeBefore && customExtensionNames.value.includes(nodeBefore.type.name)) ||
    (nodeAfter && customExtensionNames.value.includes(nodeAfter.type.name));

  console.log(isTagged);
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

export const untagEntity = async (
  parentEntityId: string,
  relationType: string,
  tagToDelete: InBulkProcessableItem,
  context: Context,
) => {
  await deleteRelations(parentEntityId, relationType, [tagToDelete], context);
};

const getEntityTypeByTagFromMapping = (tag: string): string => {
  const mappingForTag = extensionConfiguration.value.find(
    (mappingItem: TaggableEntityConfiguration) =>
      mappingItem.tag?.toLowerCase() === tag.toLowerCase(),
  );
  if (!mappingForTag)
    throw Error(`Mapping for '${tag}' tag could not be found`);
  else return mappingForTag.taggableEntityType;
};

export const openDetailModal = (node: any) => {
  const entityId = node.attrs.entityId;
  const tag = node.type.name.split("-")[0];
  const entityType = getEntityTypeByTagFromMapping(tag);
  useBaseModal().updateModal(TypeModals.EntityDetailModal, {
    entityId,
    entityType,
  });
  useBaseModal().openModal(TypeModals.EntityDetailModal, ModalStyle.CenterWide);
};
