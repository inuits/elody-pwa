import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveCreateButton from "./RepetitiveCreateButton.vue";
import type { RepetitiveCreatableType } from "@/generated-types/queries";

const singleType: RepetitiveCreatableType[] = [
  {
    label: "repetitiveForm.create-new",
    entityType: "person",
    createForm: "GetPersonCreateForm",
  },
];

// Multiple creatable subtypes (e.g. the manifestation types of a guided flow)
// open a dropdown so the user picks which type to create.
const multipleTypes: RepetitiveCreatableType[] = [
  {
    label: "types.manifestation_book",
    entityType: "manifestation_book",
    createForm: "GetManifestationBookCreateForm",
  },
  {
    label: "types.manifestation_audio",
    entityType: "manifestation_audio",
    createForm: "GetManifestationAudioCreateForm",
  },
  {
    label: "types.manifestation_music",
    entityType: "manifestation_music",
    createForm: "GetManifestationMusicCreateForm",
  },
];

const meta: Meta<typeof RepetitiveCreateButton> = {
  title: "RepetitiveForm/RepetitiveCreateButton",
  component: RepetitiveCreateButton,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof RepetitiveCreateButton>;

// A single creatable type needs no chooser: clicking emits "select" directly.
export const SingleType: Story = {
  args: {
    types: singleType,
  },
};

// More than one type: clicking opens a context menu with one option per type.
export const MultipleTypes: Story = {
  args: {
    types: multipleTypes,
  },
};

export const CustomLabel: Story = {
  args: {
    types: singleType,
    label: "repetitiveForm.add-another",
  },
};
