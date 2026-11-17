import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, ref } from "vue";
import type { Editor } from "@tiptap/vue-3";
import EntityElementWYSIWYG from "../EntityElementWYSIWYG.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";
import { PENDING_QUERY, registerQueryFixture } from "@/main";

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

const SHORT = "<p>An <strong>anthology</strong> of coastal stories.</p>";

const element = {
  __typename: "WysiwygElement",
  label: "Description",
  metadataKey: "description",
  extensions: [WysiwygExtensions.StarterKit],
};

const setupField = (formId: string, canUpdate: boolean) => {
  useFormHelper().createForm(formId, {
    intialValues: { description: SHORT },
    relationValues: {},
  } as never);
  useEditMode(formId).setPermittedEditMode({ canUpdate });
  return formId;
};

/** At rest: editable (pencil) and read-only (no pencil). */
export const States: Story = {
  render: () => ({
    components: { EntityElementWYSIWYG },
    setup: () => ({
      element,
      rows: [
        { name: "resting, editable", formId: setupField("story-wysiwyg-editable", true) },
        { name: "resting, read-only", formId: setupField("story-wysiwyg-read-only", false) },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:auto 1fr;gap:16px 24px;align-items:start;max-width:720px">
        <template v-for="row in rows" :key="row.formId">
          <code style="font-size:var(--text-label);padding-top:4px">{{ row.name }}</code>
          <div style="background:var(--color-surface)">
            <entity-element-w-y-s-i-w-y-g :form-id="row.formId" :element="element" :display-inline="true" />
          </div>
        </template>
      </div>`,
  }),
};

const savingStory = (formId: string, fails: boolean): Story => ({
  render: () => ({
    components: { EntityElementWYSIWYG },
    setup() {
      registerQueryFixture("mutateEntityValues", () => {
        if (fails) throw new Error("Saving failed");
        return PENDING_QUERY;
      });
      setupField(formId, true);
      const root = ref<HTMLElement>();
      onMounted(() => {
        setTimeout(() => {
          root.value
            ?.querySelector<HTMLButtonElement>("[data-cy=wysiwyg-edit-button]")
            ?.click();
          setTimeout(() => {
            const editorDom = root.value?.querySelector<
              HTMLElement & { editor?: Editor }
            >(".ProseMirror");
            editorDom?.editor?.commands.insertContentAt(
              editorDom.editor.state.doc.content.size - 1,
              " Revised.",
            );
            root.value
              ?.querySelector<HTMLButtonElement>("button[aria-label^='Save']")
              ?.click();
          }, 400);
        }, 400);
      });
      return { root, formId, element };
    },
    template: `
      <div ref="root" style="max-width:640px;background:var(--color-surface)">
        <entity-element-w-y-s-i-w-y-g :form-id="formId" :element="element" :display-inline="true" />
      </div>`,
  }),
});

/** A changed field after ✓: a spinner replaces ✓ and × until the save answers. */
export const Saving = savingStory("story-wysiwyg-saving", false);

/** The save failed: the editor stays open with the error under it. */
export const SaveFailed = savingStory("story-wysiwyg-save-failed", true);
