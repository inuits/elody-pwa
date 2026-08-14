import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, provide } from "vue";
import MultilingualWrapper from "./MultilingualWrapper.vue";

const translations = [
  { key: "title", lang: "en", value: "Portrait of a Lady with a Fan" },
  { key: "title", lang: "nl", value: "Portret van een dame met waaier" },
];

// Multilingual editing is a config-gated feature; this wrapper provides a
// config that enables it so the localized slot branch renders.
const MultilingualConfigProvider = defineComponent({
  setup(_, { slots }) {
    provide("config", {
      customization: {},
      features: { supportsMultilingualMetadataEditing: true },
    });
    return () => slots.default?.();
  },
});

const meta: Meta<typeof MultilingualWrapper> = {
  title: "Metadata/MultilingualWrapper",
  component: MultilingualWrapper,
  tags: ["autodocs"],
  args: {
    formId: "storybook-form",
  },
};
export default meta;

type Story = StoryObj<typeof MultilingualWrapper>;

export const Multilingual: Story = {
  args: {
    metadata: {
      key: "title",
      label: "Title",
      isMultilingual: true,
      value: translations,
    },
  },
  render: (args) => ({
    components: { MultilingualWrapper, MultilingualConfigProvider },
    setup: () => ({ args }),
    template: `
      <MultilingualConfigProvider>
        <div class="w-96 p-4 text-sm">
          <MultilingualWrapper v-bind="args">
            <template #default="{ localizedMetadata }">
              <p class="text-text-light">{{ args.metadata.label }}</p>
              <p>{{ localizedMetadata?.value || "-" }}</p>
            </template>
          </MultilingualWrapper>
        </div>
      </MultilingualConfigProvider>
    `,
  }),
};

export const NotMultilingual: Story = {
  args: {
    metadata: {
      key: "objectNumber",
      label: "Object number",
      isMultilingual: false,
      value: "SK-A-1234",
    },
  },
  render: (args) => ({
    components: { MultilingualWrapper },
    setup: () => ({ args }),
    template: `
      <div class="w-96 p-4 text-sm">
        <MultilingualWrapper v-bind="args">
          <p class="text-text-light">{{ args.metadata.label }}</p>
          <p>{{ args.metadata.value }}</p>
        </MultilingualWrapper>
      </div>
    `,
  }),
};
