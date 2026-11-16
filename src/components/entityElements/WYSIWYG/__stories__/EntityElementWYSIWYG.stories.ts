import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide, ref } from "vue";
import EntityElementWYSIWYG from "../EntityElementWYSIWYG.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementWYSIWYG> = {
  title: "EntityElements/WYSIWYGField",
  component: EntityElementWYSIWYG,
  parameters: {
    docs: {
      description: {
        component:
          "A rich-text field, edited in place as a whole: a pencil at rest, " +
          "the toolbar, save and cancel while editing.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementWYSIWYG>;

const CONTENT =
  "<p>An <strong>anthology</strong> of coastal stories, compiled for the " +
  "reading club.</p><ul><li>Twelve stories</li><li>Two languages</li></ul>";

const fieldStory = (
  formId: string,
  displayInline: boolean,
  startEditing = false,
): Story => ({
  render: () => ({
    components: { EntityElementWYSIWYG },
    setup() {
      provide("persistEntity", async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
      });
      useFormHelper().createForm(formId, {
        intialValues: { description: CONTENT },
        relationValues: {},
      } as never);
      useEditMode(formId).setPermittedEditMode({ canUpdate: true });
      const root = ref<HTMLElement>();
      onMounted(() => {
        if (!startEditing) return;
        setTimeout(
          () =>
            root.value
              ?.querySelector<HTMLButtonElement>("[data-cy=wysiwyg-edit-button]")
              ?.click(),
          400,
        );
      });
      return {
        root,
        formId,
        displayInline,
        element: {
          __typename: "WysiwygElement",
          label: "Description",
          metadataKey: "description",
          extensions: [WysiwygExtensions.StarterKit],
        },
      };
    },
    template: `
      <div ref="root" style="max-width:640px;background:var(--color-surface)">
        <entity-element-w-y-s-i-w-y-g :form-id="formId" :element="element" :display-inline="displayInline" />
      </div>`,
  }),
});

export const Default = fieldStory("story-wysiwyg-rest", true);

export const Editing = fieldStory("story-wysiwyg-editing", true, true);

export const Panel = fieldStory("story-wysiwyg-panel", false);
