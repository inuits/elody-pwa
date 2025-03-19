import { mergeAttributes, Node } from "@tiptap/core";
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
import { type Editor, Extension } from "@tiptap/vue-3";
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
};

export const extensionConfiguration = ref<
  (TaggableEntityConfiguration | TaggableEntityConfigurationFromEntity)[]
>([]);
export const tags = computed<string[]>(() =>
  extensionConfiguration.value.map(
    (configurationItem: TaggableEntityConfiguration) => configurationItem.tag,
  ),
);

export const createTipTapNodeExtension = (
  extensionConfiguration: TaggableEntityConfiguration,
) => {
  const additionalAttributes = [
    ...extensionConfiguration.tagConfigurationByEntity
      ?.metadataKeysToSetAsAttribute,
    ...extensionConfiguration.metadataKeysToSetAsAttribute,
  ];

  return Node.create({
    name: extensionConfiguration.tag,
    group: "inline",
    inline: true,
    content: "text*",
    addAttributes() {
      const attributes = {
        entityId: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-entity-id"),
          renderHTML: (attributes) => {
            if (!attributes.entityId) {
              return {};
            }

            return {
              "data-entity-id": attributes.entityId,
            };
          },
        },
      };

      if (additionalAttributes) {
        additionalAttributes.forEach((attribute) => {
          attributes[attribute] = {
            [attribute]: {
              default: null,
              parseHTML: (element) => element.getAttribute(`data-${attribute}`),
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
    renderHTML({ HTMLAttributes }) {
      return [extensionConfiguration.tag, mergeAttributes(HTMLAttributes), 0];
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
          const configurationItem = getExtensionConfigurationForEntity(entity);
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
              (key: string) =>
                Object.assign(additionalAttributes, {
                  [key]: entity.intialValues[key] || "",
                }),
            );
          }

          const { selection } = state;
          const { from, to } = selection;
          let selectedText = state.doc.textBetween(from, to, " ");

          if (newText && newText !== selectedText)
            selectedText = newText.toLowerCase();

          const newNodeContent = {
            type: configurationItem.tag,
            attrs: {
              entityId: entity.id,
            },
            content: [{ type: "text", text: selectedText }],
          };

          Object.assign(newNodeContent.attrs, additionalAttributes);

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, newNodeContent);
          commands.selectNodeForward();
          commands.insertContent({ type: "text", text: " " });

          view.focus();
          useBaseModal().closeModal(TypeModals.ElodyEntityTaggingModal);
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          const { selection } = state;
          const { empty, anchor } = selection;
          const { getEntityUuid } = useEntitySingle();

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            const entityExtensionConfiguration =
              extensionConfiguration.value.find(
                (mappingItem: TaggableEntityConfiguration) =>
                  mappingItem.tag === node.type.name,
              );
            if (entityExtensionConfiguration) {
              tr.insertText("", pos, pos + node.nodeSize);
              deleteRelations(
                getEntityUuid(),
                entityExtensionConfiguration.relationType,
                [{ key: node.attrs.entityId }],
                BulkOperationsContextEnum.TagEntityModal,
                false,
              );
            }
          });
        }),
    };
  },
});

export const setExtensionConfiguration = (
  TaggableEntityConfiguration: TaggableEntityConfiguration,
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
            ],
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
  const configurationsByEntity: TaggableEntityConfiguration[] =
    configurations.filter(
      (configurationItem) => configurationItem.tagConfigurationByEntity,
    );
  if (!configurationsByEntity.length) return;

  const query = GetEntitiesDocument;

  const configurationItemEntitiesMappingPromises: Promise<{
    configurationItem: TaggableEntityConfiguration;
    configurationEntities: BaseEntity[];
  }>[] = configurationsByEntity.map(async (configurationItem) => {
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

const applyColorStylingFromConfigurationToEditor = (
  configurations: TaggableEntityConfigurationFromEntity[],
) => {
  const style = document.createElement("style");
  configurations.forEach(
    (configurationItem: TaggableEntityConfigurationFromEntity) => {
      style.textContent += `
      #wysiwyg-container ${configurationItem.tag} {
        background-color: ${configurationItem.tagColor};
        color: #fff;
        border-radius: 0.375rem;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
        cursor: pointer;
      }`;
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
): TaggableEntityConfiguration | undefined => {
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
  const { selection } = editor.state;
  const { from } = selection;
  const selectedNode = editor.state.doc.nodeAt(from);

  return selectedNode && tags.value.includes(selectedNode.type.name);
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
      mappingItem.tag?.toLowerCase() === tag,
  );
  if (!mappingForTag)
    throw Error(`Mapping for '${tag}' tag could not be found`);
  else return mappingForTag.entityType;
};

const openDetailModal = (element: HTMLElement) => {
  const entityId = element.getAttribute("data-entity-id");
  const tag = element.localName;
  const entityType = getEntityTypeByTagFromMapping(tag);
  useBaseModal().updateModal(TypeModals.EntityDetailModal, {
    entityId,
    entityType,
  });
  useBaseModal().openModal(TypeModals.EntityDetailModal, ModalStyle.CenterWide);
};

const listenToHoveredElements = (
  elementsToListenTo: HTMLElement[],
  enable: boolean = true,
  event: string = "click",
) => {
  elementsToListenTo.forEach((element: HTMLElement) => {
    if (enable) element.addEventListener(event, () => openDetailModal(element));
    else element.removeEventListener(event, () => openDetailModal(element));
  });
};

export const setTaggedEntityInfoTooltip = (
  tipTapDocumentNode: HTMLDivElement,
  enable: boolean = true,
) => {
  if (!tipTapDocumentNode) return;

  tags.value.forEach(async (node: string) => {
    const elements: HTMLElement[] = Array.from(
      tipTapDocumentNode.getElementsByTagName(node),
    );
    if (!elements) return;
    listenToHoveredElements(elements, enable);
  });
};
