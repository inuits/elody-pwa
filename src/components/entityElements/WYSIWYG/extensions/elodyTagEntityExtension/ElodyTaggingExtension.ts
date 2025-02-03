import { Node } from "@tiptap/core";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const TagExtension = Node.create({
  name: "tag",

  addSchema() {
    return {
      group: "inline",
      inline: true,
      attrs: {
        tag: { default: null },
      },
      parseDOM: [
        {
          tag: "span[data-tag]",
          getAttrs: (dom) => ({
            tag: dom.getAttribute("data-tag"),
          }),
        },
      ],
      toDOM: (node) => [
        "span",
        {
          "data-tag": node.attrs.tag,
          class: "bg-blue-500 text-white rounded-full px-2 py-1 inline-block",
        },
        node.content,
      ],
    };
  },

  addCommands() {
    return {
      openTagModal:
        () =>
        ({ commands, state }) => {
          const { selection } = state;
          const { from, to } = selection;

          const { openModal } = useBaseModal();
          openModal(TypeModals.ElodyEntityTaggingModal, ModalStyle.Center);
        },
    };
  },
});

export default TagExtension;
