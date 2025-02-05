import { mergeAttributes, Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const ElodyTaggingExtension = Node.create({
  name: "ElodyTaggingExtension",
  group: "inline",
  inline: true,
  content: "text*",
  parseHTML() {
    return [{ tag: 'span[data-tag="ElodyTaggingExtension"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        {
          "data-tag": "ElodyTaggingExtension",
          class: "bg-accent-normal text-white rounded-md px-1",
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
        ({ commands, state, view }) => {
          const { selection } = state;
          const { from, to } = selection;
          const selectedText = state.doc.textBetween(from, to, " ");

          const { openModal, updateModal, closeModal } = useBaseModal();
          updateModal(TypeModals.ElodyEntityTaggingModal, { selectedText });
          openModal(TypeModals.ElodyEntityTaggingModal, ModalStyle.Center);

          commands.deleteRange({ from, to });
          commands.insertContentAt(from, {
            type: this.name,
            attrs: { tag: "your-tag-value" },
            content: [{ type: "text", text: selectedText }],
          });
          commands.selectNodeForward();
          commands.insertContent({ type: "text", text: " " });

          view.focus();
        },
    };
  },
});

export default ElodyTaggingExtension;
