import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, provide, ref, watch } from "vue";
import MultilingualLocaleSelector from "../MultilingualLocaleSelector.vue";
import { getMultilingualProvideKey } from "@/composables/useMultilingualField";

const meta: Meta<typeof MultilingualLocaleSelector> = {
  title: "Metadata/MultilingualLocaleSelector",
  component: MultilingualLocaleSelector,
  parameters: {
    docs: {
      description: {
        component:
          "The language picker next to a multilingual field's label. It " +
          "reads the field's multilingual state from its provider and renders " +
          "nothing for a field that is not multilingual.",
      },
    },
  },
  argTypes: {
    selectedLocale: { control: "inline-radio", options: ["en", "nl", "fr"] },
  },
};

export default meta;
type Story = StoryObj<
  typeof MultilingualLocaleSelector & {
    selectedLocale: string;
    isEnabled: boolean;
  }
>;

export const Default: Story = {
  args: { fieldKey: "title", selectedLocale: "nl", isEnabled: true } as never,
  render: (args) => ({
    components: { MultilingualLocaleSelector },
    setup() {
      const a = args as unknown as {
        fieldKey: string;
        selectedLocale: string;
        isEnabled: boolean;
      };
      const selectedLocale = ref(a.selectedLocale);
      watch(
        () => a.selectedLocale,
        (v) => (selectedLocale.value = v),
      );
      provide(getMultilingualProvideKey(a.fieldKey), {
        currentValue: computed(() => ""),
        selectedLocale,
        localeOptions: computed(() =>
          ["en", "nl", "fr"].map((value) => ({
            icon: undefined,
            label: value.toUpperCase(),
            value,
          })),
        ),
        isEnabled: computed(() => a.isEnabled),
        showSelector: true,
        updateValue: () => undefined,
      });
      return { a };
    },
    template: `<div style="max-width:120px"><multilingual-locale-selector :field-key="a.fieldKey" /></div>`,
  }),
};
