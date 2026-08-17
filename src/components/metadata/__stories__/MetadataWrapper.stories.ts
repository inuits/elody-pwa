import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataWrapper from "../MetadataWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta<typeof MetadataWrapper> = {
  // Story id metadata-metadatawrapper--default, per MANIFEST.md.
  title: "Metadata/MetadataWrapper",
  component: MetadataWrapper,
  parameters: {
    docs: {
      description: {
        component:
          "One metadata field: an 11.5px bold label in field-label blue over " +
          "a 13px value. An empty non-required value reads as absent — " +
          "\"Geen waarde\" at 45% opacity — rather than as a dash that could " +
          "be mistaken for content. Booleans render as Ja/Nee with a check " +
          "or a dash, never as a checkbox standing in for a value.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataWrapper>;

const FORM_ID = "story-field-row";

const field = (key: string, label: string, value: unknown) => ({
  label,
  key,
  value,
});

/** A boolean only reads as Ja/Nee when the field declares itself a checkbox. */
const booleanField = (key: string, label: string, value: boolean) => ({
  ...field(key, label, value),
  inputField: { type: InputFieldTypes.Checkbox },
});

export const Default: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup() {
      const { createForm } = useFormHelper();
      createForm(FORM_ID, {
        intialValues: {
          title: "Verhalen uit de Noordzee",
          summary: "",
          digitised: true,
          restricted: false,
        },
        relationValues: {},
      } as never);

      return {
        formId: FORM_ID,
        rows: [
          field("title", "Titel", "Verhalen uit de Noordzee"),
          field("summary", "Samenvatting", ""),
          booleanField("digitised", "Gedigitaliseerd", true),
          booleanField("restricted", "Beperkt raadpleegbaar", false),
        ],
      };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:420px">
        <metadata-wrapper
          v-for="row in rows"
          :key="row.key"
          :is-edit="false"
          :form-id="formId"
          :metadata="row"
        />
      </div>`,
  }),
};
