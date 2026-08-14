import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseButtonNew from "./BaseButtonNew.vue";
import { DamsIcons } from "@/generated-types/queries";

// Titled "Base/BaseButton" so the manifest id `base-basebutton--variants`
// resolves: BaseButtonNew.vue IS the design-system button (the legacy
// colour-prop BaseButton.vue is retired).
const meta: Meta<typeof BaseButtonNew> = {
  title: "Base/BaseButton",
  component: BaseButtonNew,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: Object.values(DamsIcons) },
    buttonStyle: {
      control: "select",
      options: ["primary", "secondary", "ghost", "accentAccent", "redDefault"],
    },
    buttonSize: { control: "select", options: ["normal", "small", "verySmall"] },
  },
  parameters: {
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof BaseButtonNew>;

/** The full design-system variant grid: primary / secondary / ghost / danger
 *  (redDefault) / commit (accentAccent), each in both sizes, plus disabled,
 *  loading (label keeps its width) and with-icon states. */
export const Variants: Story = {
  render: () => ({
    components: { BaseButtonNew },
    setup() {
      const variants = [
        { style: "primary", label: "Open record" },
        { style: "secondary", label: "Annuleer" },
        { style: "ghost", label: "Toon meer" },
        { style: "redDefault", label: "Verwijder" },
        { style: "accentAccent", label: "Bewaar" },
      ] as const;
      const sizes = ["normal", "small"] as const;
      return { variants, sizes, DamsIcons };
    },
    template: `
      <div class="flex flex-col gap-3">
        <div v-for="size in sizes" :key="size" class="flex flex-wrap items-center gap-2">
          <span class="w-16 text-label text-text-muted">{{ size }}</span>
          <div v-for="variant in variants" :key="variant.style" class="w-36">
            <BaseButtonNew
              :label="variant.label"
              :button-style="variant.style"
              :button-size="size"
              force-show-label
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-16 text-label text-text-muted">states</span>
          <div class="w-36"><BaseButtonNew label="Bewaar" button-style="accentAccent" disabled force-show-label /></div>
          <div class="w-36"><BaseButtonNew label="Bewaar" button-style="accentAccent" loading force-show-label /></div>
          <div class="w-36"><BaseButtonNew label="Download" button-style="secondary" :icon="DamsIcons.DownloadAlt" force-show-label /></div>
        </div>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: {
    label: "Save",
    icon: DamsIcons.Check,
    buttonStyle: "accentAccent",
    forceShowLabel: true,
  },
};

export const Loading: Story = {
  args: {
    label: "Saving…",
    loading: true,
    buttonStyle: "accentAccent",
    forceShowLabel: true,
  },
};

export const Destructive: Story = {
  args: {
    label: "Delete",
    icon: DamsIcons.Trash,
    buttonStyle: "redDefault",
    forceShowLabel: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Save",
    disabled: true,
    forceShowLabel: true,
  },
};
