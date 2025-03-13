import { mergeAttributes, Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type BaseEntity,
  type Entity,
  Entitytyping,
  ModalStyle,
  type TagConfigurationByEntity,
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
import { ref, computed } from "vue";

const { addRelations } = useFormHelper();
const { deleteRelations } = useDeleteRelations();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

export const extensionConfiguration = ref<TaggableEntityConfiguration[]>([]);
export const tags = computed<string[]>(() =>
  extensionConfiguration.value.map(
    (configurationItem: TaggableEntityConfiguration) => configurationItem.tag,
  ),
);

export const createTipTapNodeExtension = (
  extensionConfiguration: TaggableEntityConfiguration,
) => {
  return Node.create({
    name: extensionConfiguration.tag,
    group: "inline",
    inline: true,
    content: "text*",
    addAttributes() {
      return {
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
    },
    parseHTML() {
      return [
        {
          tag: extensionConfiguration.tag,
          getAttrs: (element) => {
            return {
              entityId: element.getAttribute("data-entity-id"),
            };
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
        ({ commands, state, view }) => {
          const configurationItem = getExtensionConfigurationForEntityType(
            entity.type,
          );
          if (!entity) throw Error("Error tagging text: no entity to tag");
          if (
            !configurationItem.tag &&
            !configurationItem.tagConfigurationByEntity
          )
            throw Error(
              "Error tagging text: config should contain either 'tag' or 'tagConfigurationByEntity'",
            );

          console.log(entity);

          const { selection } = state;
          const { from, to } = selection;
          let selectedText = state.doc.textBetween(from, to, " ");

          if (configurationItem.tagConfigurationByEntity)
            configureNewPlugin(
              entity,
              configurationItem.tagConfigurationByEntity,
              this.editor,
            );

          if (newText && newText !== selectedText)
            selectedText = newText.toLowerCase();

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, {
            type: configurationItem.tag,
            attrs: {
              entityId: entity.id,
            },
            content: [{ type: "text", text: selectedText }],
          });
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

const registerNewTaggingExtension = (
  editor: Editor,
  tagConfigurationByEntity: TagConfigurationByEntity,
) => {
  console.log(editor, tagConfigurationByEntity);
};

const getPluginDetailsFromEntity = (
  entity: BaseEntity,
  tagConfigurationByEntity: TagConfigurationByEntity,
) => {
  const tagConfigurationEntityId =
    entity.relationValues[
      tagConfigurationByEntity.configurationEntityRelationType
    ][0].id;
};

const configureNewPlugin = (
  entity: BaseEntity,
  tagConfigurationByEntity: TagConfigurationByEntity,
  editor: Editor,
) => {
  getPluginDetailsFromEntity(entity, tagConfigurationByEntity);

  registerNewTaggingExtension(editor, tagConfigurationByEntity);
};

export const getExtensionConfigurationForEntityType = (
  entityType: Entitytyping,
): TaggableEntityConfiguration =>
  extensionConfiguration.value.find(
    (configurationItem: TaggableEntityConfiguration) =>
      configurationItem.taggableEntityType === entityType,
  );

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
    (mappingItem: TaggableEntityConfiguration) => mappingItem.tag === tag,
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
