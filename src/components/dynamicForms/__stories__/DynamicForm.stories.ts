import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseTabs from "@/components/BaseTabs.vue";
import BaseTab from "@/components/BaseTab.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta = {
  // Story id repetitiveform-dynamicform--tabs, per MANIFEST.md. The full form
  // is a self-describing GraphQL query — its definition lives in client query
  // documents — so the story shows the chrome the docs page specifies: the
  // tab row with its error dot, field rows, and the one submit zone.
  title: "RepetitiveForm/DynamicForm",
  parameters: {
    docs: {
      description: {
        component:
          "The form's structure comes entirely from a client query document; " +
          "what the design system owns is the chrome. Tabs follow the tabs " +
          "pattern — 12.5px bold, active underlined in the accent, a danger " +
          "dot on a tab holding errors — and every form ends in one sticky " +
          "submit zone: validation summary left, Bewaar and Annuleer right. " +
          "Never a save button per section.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const FORM_ID = "story-dynamic-form";

export const Tabs: Story = {
  render: () => ({
    components: { BaseTabs, BaseTab, BaseButton, MetadataWrapper },
    setup() {
      useFormHelper().createForm(FORM_ID, {
        intialValues: { title: "Verhalen uit de Noordzee", author: "" },
        relationValues: {},
      } as never);
      return {
        formId: FORM_ID,
        fields: [
          {
            label: "Titel",
            key: "title",
            value: "Verhalen uit de Noordzee",
            inputField: { type: InputFieldTypes.Text, label: "Titel" },
          },
          {
            label: "Auteur",
            key: "author",
            value: "",
            inputField: { type: InputFieldTypes.Text, label: "Auteur" },
          },
        ],
      };
    },
    template: `
      <div style="max-width:560px">
        <base-tabs
          :tabs="['Werk', 'Expressie', 'Manifestatie']"
          :tab-navigation-disabled="false"
          :error-tabs="[1]"
          error-dot-title="Deze tab bevat fouten"
        >
          <base-tab>
            <div style="display:flex;flex-direction:column;gap:12px;padding:6px 0">
              <metadata-wrapper
                v-for="field in fields"
                :key="field.key"
                :is-edit="false"
                :form-id="formId"
                :metadata="field"
              />
            </div>
          </base-tab>
          <base-tab><p style="font-size:var(--text-value)">…</p></base-tab>
          <base-tab><p style="font-size:var(--text-value)">…</p></base-tab>
        </base-tabs>

        <div
          role="group"
          aria-label="Formulier-acties"
          style="display:flex;align-items:center;justify-content:flex-end;gap:10px;
                 margin-top:10px;padding:8px 0;border-top:1px solid var(--color-border-subtle)"
        >
          <p role="alert" style="margin-right:auto;font-size:var(--text-hint);color:var(--color-danger)">
            Controleer de gemarkeerde velden (2)
          </p>
          <base-button button-style="ghost" button-size="sm" label="Annuleer" style="width:auto" />
          <base-button button-style="commit" button-size="sm" label="Bewaar" style="width:auto" />
        </div>
      </div>`,
  }),
};
