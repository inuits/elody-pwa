import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, defineComponent, provide, ref } from "vue";
import MultilingualLocaleSelector from "./MultilingualLocaleSelector.vue";
import { getMultilingualProvideKey } from "@/composables/useMultilingualField";

// The selector only renders when a parent (MultilingualWrapper) provides a
// multilingual context for its field key, so the story supplies one itself.
const MultilingualProvider = defineComponent({
  setup(_, { slots }) {
    const selectedLocale = ref("en");
    const currentValue = ref("Portrait of a Lady with a Fan");
    provide(getMultilingualProvideKey("title"), {
      currentValue: computed(() => currentValue.value),
      selectedLocale,
      localeOptions: computed(() => [
        { icon: undefined, label: "English", value: "en" },
        { icon: undefined, label: "Nederlands", value: "nl" },
        { icon: undefined, label: "Français", value: "fr" },
      ]),
      isEnabled: computed(() => true),
      showSelector: true,
      updateValue: (newValue: string) => (currentValue.value = newValue),
    });
    return () => slots.default?.();
  },
});

const meta: Meta<typeof MultilingualLocaleSelector> = {
  title: "Metadata/MultilingualLocaleSelector",
  component: MultilingualLocaleSelector,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MultilingualLocaleSelector>;

export const Default: Story = {
  args: {
    fieldKey: "title",
  },
  render: (args) => ({
    components: { MultilingualLocaleSelector, MultilingualProvider },
    setup: () => ({ args }),
    template: `
      <MultilingualProvider>
        <div class="w-96 p-4">
          <MultilingualLocaleSelector v-bind="args" />
        </div>
      </MultilingualProvider>
    `,
  }),
};

export const WithoutContext: Story = {
  args: {
    fieldKey: "description",
  },
  render: (args) => ({
    components: { MultilingualLocaleSelector },
    setup: () => ({ args }),
    template: `
      <div class="w-96 p-4 text-sm text-text-light">
        <MultilingualLocaleSelector v-bind="args" />
        <p>(renders nothing when no multilingual context is provided)</p>
      </div>
    `,
  }),
};
