import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementWYSIWYG from "./EntityElementWYSIWYG.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import {
  WysiwygExtensions,
  type WysiwygElement,
} from "@/generated-types/queries";

// The editor takes its content from the entity form (by metadataKey), so each
// story seeds a form before mounting. Extensions are dynamically imported;
// the starter kit covers the standard toolbar.
const wysiwygElement = (
  overrides: Partial<WysiwygElement> = {},
): WysiwygElement =>
  ({
    __typename: "WysiwygElement",
    label: "Description",
    metadataKey: "description",
    extensions: [WysiwygExtensions.StarterKit],
    taggingConfiguration: undefined,
    // The component dereferences this without optional chaining once the
    // editor is ready (virtualKeyboardLayouts / showLineNumbers), so the
    // fixture must carry an (empty) configuration object.
    wysiwygElementConfiguration: {
      __typename: "WysiwygElementConfiguration",
      customEditorStyles: null,
      showLineNumbers: false,
      transliterationConfig: null,
      virtualKeyboardLayouts: null,
    },
    ...overrides,
  }) as unknown as WysiwygElement;

const seedForm = (formId: string) => {
  const { getForm, createForm } = useFormHelper();
  if (!getForm(formId))
    createForm(formId, {
      intialValues: {
        description:
          "<p>Ceremonial mask from the <strong>Kuba kingdom</strong>, " +
          "collected during the 1911 expedition.</p>" +
          "<p>Wood, raffia and cowrie shells; traces of tukula pigment.</p>",
      },
      relationValues: {},
    } as any);
};

const meta: Meta<typeof EntityElementWYSIWYG> = {
  title: "EntityElements/Wysiwyg/EntityElementWYSIWYG",
  component: EntityElementWYSIWYG,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EntityElementWYSIWYG>;

export const ReadMode: Story = {
  args: {
    formId: "wysiwyg-read-demo",
    element: wysiwygElement(),
    displayInline: false,
  },
  render: (args) => ({
    components: { EntityElementWYSIWYG },
    setup: () => {
      seedForm(args.formId);
      return { args };
    },
    template:
      '<div class="max-w-3xl p-4"><EntityElementWYSIWYG v-bind="args" /></div>',
  }),
};

export const EditMode: Story = {
  args: {
    formId: "wysiwyg-edit-demo",
    element: wysiwygElement(),
    displayInline: false,
  },
  render: (args) => ({
    components: { EntityElementWYSIWYG },
    setup: () => {
      seedForm(args.formId);
      useEditMode(args.formId).enableEdit();
      return { args };
    },
    template:
      '<div class="max-w-3xl p-4"><EntityElementWYSIWYG v-bind="args" /></div>',
  }),
};
