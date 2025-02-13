import { mergeAttributes, Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  ModalStyle,
  TypeModals,
  WysiwygExtensions,
} from "@/generated-types/queries";
import type { Editor } from "@tiptap/vue-3";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";

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
        tag: 'w[data-tag="ElodyTaggingExtension"]',
        getAttrs: (element) => {
          console.log(element);
          return {
            entityId: element.getAttribute("data-entity-id"),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    console.log(HTMLAttributes);
    const { entityId } = HTMLAttributes;
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
        (entityId: string) =>
        ({ commands, state, view }) => {
          if (!entityId) return;
          const { selection } = state;
          const { from, to } = selection;
          const selectedText = state.doc.textBetween(from, to, " ");

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, {
            type: this.name,
            attrs: {
              "data-tag": this.name,
              entityId,
            },
            content: [{ type: "text", text: selectedText }],
          });
          commands.selectNodeForward();
          commands.insertContent({ type: "text", text: " " });

          view.focus();
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              this.editor.commands.deleteNode(node);
            }
          });
        }),
    };
  },
});

export default ElodyTaggingExtension;
