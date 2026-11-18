import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide, ref } from "vue";
import InlineFieldEditor from "../InlineFieldEditor.vue";
import MetadataWrapper from "../MetadataWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { registerQueryFixture } from "@/main";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta<typeof InlineFieldEditor> = {
  title: "Metadata/InlineFieldEditor",
  component: InlineFieldEditor,
  parameters: {
    docs: {
      description: {
        component:
          "The input a field row swaps to while one field is edited: the " +
          "input for the field type, a save (✓) and a cancel (×) button, and " +
          "a keyboard hint below. The field row opens it, validates and saves; " +
          "the editor itself only emits save and cancel.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineFieldEditor>;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Expired", value: "expired" },
];

const openFirstField = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  canvasElement
    .querySelector<HTMLElement>('[data-cy="field-value"][role="button"]')
    ?.click();
};

export const Editing: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup() {
      const formId = "story-inline-editing";
      useEditMode(formId).setPermittedEditMode({ canUpdate: true });
      useFormHelper().createForm(formId, {
        intialValues: { title: "Tales from the North Sea" },
        relationValues: {},
      } as never);
      return {
        formId,
        field: {
          key: "title",
          label: "Title",
          value: "Tales from the North Sea",
          inputField: { type: InputFieldTypes.Text, label: "Title" },
        },
      };
    },
    template: `
      <div style="max-width:440px">
        <metadata-wrapper :is-edit="false" :form-id="formId" :metadata="field" />
      </div>`,
  }),
  play: openFirstField,
};

export const FieldTypes: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    setup: () => ({ InputFieldTypes, statusOptions }),
    template: `
      <div style="display:grid;grid-template-columns:90px minmax(0,360px);gap:18px 16px;align-items:start">
        <code style="font-size:var(--text-label);padding-top:10px">number</code>
        <inline-field-editor :type="InputFieldTypes.Number" :model-value="1987" label="Year" />
        <code style="font-size:var(--text-label);padding-top:10px">textarea</code>
        <inline-field-editor :type="InputFieldTypes.Textarea" model-value="A longer note from the cataloguer." label="Summary" />
        <code style="font-size:var(--text-label);padding-top:10px">dropdown</code>
        <inline-field-editor :type="InputFieldTypes.Dropdown" model-value="draft" label="Status" :options="statusOptions" />
        <code style="font-size:var(--text-label);padding-top:10px">checkbox</code>
        <inline-field-editor :type="InputFieldTypes.Checkbox" :model-value="true" label="Digitised" />
        <code style="font-size:var(--text-label);padding-top:10px">colour</code>
        <inline-field-editor :type="InputFieldTypes.Color" model-value="#2f7f8c" label="Colour" />
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    template: `
      <div style="display:grid;grid-template-columns:90px minmax(0,360px);gap:18px 16px;align-items:start">
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">editing</span>
        <inline-field-editor type="text" model-value="Tales from the North Sea" label="Title" />
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">saving</span>
        <inline-field-editor type="text" model-value="Tales from the Wadden Sea" label="Title" :saving="true" />
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">error</span>
        <inline-field-editor type="text" model-value="" label="Title" error-message="Title is required" />
      </div>`,
  }),
};

const company = (id: string, name: string) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "company",
  intialValues: { __typename: "IntialValues", name },
});

const companies = [
  company("c-1", "Harbour Press"),
  company("c-2", "North Sea Publishers"),
  company("c-3", "Lighthouse Books"),
];

export const Relation: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup() {
      provide("config", { features: {} });
      const linked = [
        { key: "c-1", type: "ref_publishers", editStatus: "unchanged" },
      ];
      provide(
        "ParentEntityProvider",
        ref({
          id: "story-inline-relation",
          uuid: "story-inline-relation",
          type: "asset",
          relationValues: { ref_publishers: linked },
        }),
      );
      registerQueryFixture(
        "getEntities",
        (variables: {
          advancedFilterInputs?: { key?: unknown; value?: unknown }[];
        }) => {
          const selection = variables.advancedFilterInputs?.find(
            (filter) => Array.isArray(filter.value),
          );
          const results = selection
            ? companies.filter((entry) =>
                (selection.value as string[]).includes(entry.id),
              )
            : companies;
          return {
            Entities: {
              __typename: "EntitiesResults",
              count: results.length,
              limit: 20,
              facets: [],
              results,
            },
          };
        },
      );
      const formId = "story-inline-relation";
      useEditMode(formId).setPermittedEditMode({ canUpdate: true });
      useFormHelper().createForm(formId, {
        intialValues: {},
        relationValues: { ref_publishers: linked },
      } as never);
      return {
        formId,
        field: {
          __typename: "PanelMetaData",
          key: "ref_publishers",
          label: "Publisher",
          value: "Harbour Press",
          inputField: {
            __typename: "InputField",
            type: InputFieldTypes.DropdownMultiselectRelations,
            label: "Publisher",
            entityType: "company",
            relationType: "ref_publishers",
            advancedFilterInputForRetrievingOptions: [
              { type: "text", key: ["name"], value: "*", match_exact: false },
            ],
            advancedFilterInputForSearchingOptions: {
              type: "text",
              key: ["name"],
              value: "*",
              match_exact: false,
              item_types: ["company"],
            },
            relationFilter: {
              type: "selection",
              key: ["identifiers"],
              value: "$relationValues.ref_publishers.key",
              match_exact: true,
              item_types: ["company"],
            },
          },
        },
      };
    },
    template: `
      <div style="max-width:440px">
        <metadata-wrapper :is-edit="false" :form-id="formId" :metadata="field" />
      </div>`,
  }),
  play: openFirstField,
};
