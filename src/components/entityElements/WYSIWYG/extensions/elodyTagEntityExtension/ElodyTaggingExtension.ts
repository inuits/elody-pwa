import { mergeAttributes, Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  Entitytyping,
  ModalStyle,
  type TaggingExtensionNodeMapping,
  TypeModals,
  WysiwygExtensions,
} from "@/generated-types/queries";
import type { Editor } from "@tiptap/vue-3";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import {
  BulkOperationsContextEnum,
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useFormHelper } from "@/composables/useFormHelper";
import { useDeleteRelations } from "@/composables/useDeleteRelations";
import useEntitySingle from "@/composables/useEntitySingle";

const { addRelations } = useFormHelper();
const { deleteRelations } = useDeleteRelations();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

let nodeMapping: TaggingExtensionNodeMapping[] = [];

const ElodyTaggingExtension = Node.create({
  name: "ElodyTaggingExtension",
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
        tag: "w",
        getAttrs: (element) => {
          return {
            entityId: element.getAttribute("data-entity-id"),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["w", mergeAttributes(HTMLAttributes), 0];
  },
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
          if (!entity) return;

          const { selection } = state;
          const { from, to } = selection;
          let selectedText = state.doc.textBetween(from, to, " ");

          if (newText && newText !== selectedText)
            selectedText = newText.toLowerCase();

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, {
            type: this.name,
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
            if (node.type.name === this.name) {
              this.editor.commands.deleteNode(node);
              deleteRelations(
                getEntityUuid(),
                "refWords",
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

export const hasSelectionBeenTagged = (editor: Editor) => {
  const { selection } = editor.state;
  const { from } = selection;
  const selectedNode = editor.state.doc.nodeAt(from);
  return (
    selectedNode &&
    selectedNode.type.name ===
      useWYSIWYGEditor().editorExtensionImportMapping[
        WysiwygExtensions.ElodyTaggingExtension
      ].importName
  );
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
  const mappingForTag = nodeMapping.find(
    (mappingItem: TaggingExtensionNodeMapping) => mappingItem.tag === tag,
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
  customNodeMapping: TaggingExtensionNodeMapping[] | undefined = undefined,
) => {
  if (!tipTapDocumentNode) return;
  if (customNodeMapping) nodeMapping = customNodeMapping;
  const tags = nodeMapping.map(
    (nodeMappingItem: TaggingExtensionNodeMapping) => nodeMappingItem.tag,
  );
  tags.forEach(async (node: string) => {
    const elements: HTMLElement[] = Array.from(
      tipTapDocumentNode.getElementsByTagName(node),
    );
    if (!elements) return;
    listenToHoveredElements(elements, enable);
  });
};

export default ElodyTaggingExtension;
