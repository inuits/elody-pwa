import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
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
        { isOn: true, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl, label: "library.view-modes.list" },
        { isOn: false, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps, label: "library.view-modes.grid" },
        { isOn: false, iconOn: DamsIcons.Table, iconOff: DamsIcons.Table, label: "library.view-modes.table" },
      ]),
    }),
    template: `<base-toggle-group :toggles="toggles" />`,
  }),
};

/** Text segments: a toggle without an icon shows its label. */
export const TextSegments: Story = {
  render: () => ({
    components: { BaseToggleGroup },
    setup: () => ({
      toggles: ref([
        { isOn: true, label: "Large" },
        { isOn: false, label: "Compact" },
      ]),
    }),
    template: `<base-toggle-group group-label="Card size" :toggles="toggles" />`,
  }),
};

/** The list toolbar's view switch, the grid in two sizes. */
export const States: Story = {
  render: () => ({
    components: { BaseToggleGroup },
    setup: () => ({
      views: ref([
        { isOn: false, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl, label: "library.view-modes.list" },
        { isOn: false, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps, label: "library.view-modes.grid" },
        { isOn: true, iconOn: DamsIcons.Th, iconOff: DamsIcons.Th, label: "library.view-modes.grid-compact" },
        { isOn: false, iconOn: DamsIcons.Table, iconOff: DamsIcons.Table, label: "library.view-modes.table" },
      ]),
    }),
    template: `<base-toggle-group :toggles="views" />`,
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

export const Playground: Story = {
  args: {
    toggles: [
      { isOn: true, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
      { isOn: false, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
      { isOn: false, iconOn: DamsIcons.Table, iconOff: DamsIcons.Table },
    ],
  },
  argTypes: { onSelected: { action: "selected" } },
};

export const TogglePlayground: StoryObj<typeof BaseToggle> = {
  args: {
    modelValue: false,
    iconOn: DamsIcons.Eye,
    iconOff: DamsIcons.Apps,
    iconHeight: 18,
    isPartOfToggleGroup: false,
  },
  argTypes: {
    iconOn: { control: "select", options: Object.values(DamsIcons) },
    iconOff: { control: "select", options: Object.values(DamsIcons) },
    "onUpdate:modelValue": { action: "update:modelValue" },
    onTurnAllTogglesInGroupOff: { action: "turnAllTogglesInGroupOff" },
  },
  render: (args) => ({
    components: { BaseToggle },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (v) => (value.value = v),
      );
      return { args, value };
    },
    template: `<base-toggle v-bind="args" v-model="value" />`,
  }),
};
