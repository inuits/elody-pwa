import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WYSIWYGTransliterationToggle from "./WYSIWYGTransliterationToggle.vue";
import type { WysiwygTransliterationConfig } from "@/generated-types/queries";

// The toggle derives one button per mapping object in the transliteration
// config. Without an editor it still renders and switches its active state.
const transliterationConfig = {
  __typename: "WysiwygTransliterationConfig",
  enabledByProperty: null,
  original: { label: "Original", mapping: null },
  romanized: {
    label: "Romanized",
    mapping: { α: "a", β: "b", γ: "g", δ: "d" },
    insertSpaces: false,
  },
  syllables: {
    label: "Syllables",
    mapping: { α: "a", β: "ba", γ: "ga" },
    insertSpaces: true,
  },
} as unknown as WysiwygTransliterationConfig;

const meta: Meta<typeof WYSIWYGTransliterationToggle> = {
  title: "EntityElements/Wysiwyg/WYSIWYGTransliterationToggle",
  component: WYSIWYGTransliterationToggle,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof WYSIWYGTransliterationToggle>;

export const Default: Story = {
  args: {
    editor: undefined,
    transliterationConfig,
  },
};

export const WithoutConfig: Story = {
  args: {
    editor: undefined,
    transliterationConfig: null,
  },
};
