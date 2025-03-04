import { mergeAttributes, Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  ModalStyle,
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
import { useRoute } from "vue-router";
import useEntitySingle from "@/composables/useEntitySingle";

const { addRelations } = useFormHelper();
const { deleteRelations } = useDeleteRelations();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

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
      relationType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-relation-type"),
        renderHTML: (attributes) => {
          if (!attributes.relationType) {
            return {};
          }

          return {
            "data-relation-type": attributes.relationType,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'w[data-tag="ElodyTaggingExtension"]',
        getAttrs: (element) => {
          return {
            entityId: element.getAttribute("data-entity-id"),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "w",
      mergeAttributes(
        {
          "data-tag": this.name,
          class: "bg-accent-normal text-white rounded-md px-1 cursor-pointer",
        },
        HTMLAttributes,
      ),
      0,
    ];
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
              "data-tag": this.name,
              entityId: entity.id,
              relationType: relationType,
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

export default ElodyTaggingExtension;
