import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import BaseToggleGroup from "../BaseToggleGroup.vue";
import BaseToggle from "../BaseToggle.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BaseToggleGroup> = {
  // Story id base-basetogglegroup--default, embedded by toggle-and-slider.md.
  title: "Base/BaseToggleGroup",
  component: BaseToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Segmented one-of-N control, used for the library's view-mode " +
          "switch (list / grid / table / map). Exactly one segment is on: " +
          "turning a segment on turns the others off, and the group refuses " +
          "to end up with none active. Each segment is a real button with " +
          "aria-pressed, so the active mode is announced.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseToggleGroup>;

export const Default: Story = {
  render: () => ({
    components: { BaseToggleGroup },
    setup: () => ({
      toggles: ref([
        { isOn: true, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
        { isOn: false, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
        { isOn: false, iconOn: DamsIcons.Table, iconOff: DamsIcons.Table },
      ]),
    }),
    template: `<base-toggle-group :toggles="toggles" />`,
  }),
};

/** A single toggle outside a group: plain on/off, no exclusivity. */
export const SingleToggle: Story = {
  render: () => ({
    components: { BaseToggle },
    setup: () => ({ on: ref(false) }),
    template: `<base-toggle v-model="on" :icon-on="'EyeSlash'" :icon-off="'Eye'" />`,
  }),
};
