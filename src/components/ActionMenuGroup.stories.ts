import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ActionMenuGroup from "./ActionMenuGroup.vue";
import {
  DamsIcons,
  Entitytyping,
  type DropdownOption,
} from "@/generated-types/queries";

// Bulk-operation dropdown options as baseGraphql would declare them. A
// primary option renders as a button, the rest go into the ellipsis menu.
const options: DropdownOption[] = [
  {
    label: "Add asset",
    value: "addEntity",
    icon: DamsIcons.PlusCircle,
    primary: true,
    active: true,
  } as DropdownOption,
  {
    label: "Export selection as CSV",
    value: "exportCsv",
    icon: DamsIcons.Export,
  } as DropdownOption,
  {
    label: "Start OCR for selection",
    value: "startOcr",
    icon: DamsIcons.Process,
  } as DropdownOption,
];

const meta: Meta<typeof ActionMenuGroup> = {
  title: "Components/ActionMenuGroup",
  component: ActionMenuGroup,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="flex justify-end p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof ActionMenuGroup>;

export const Default: Story = {
  args: {
    options,
    entityType: Entitytyping.Work,
    clearSubDropdownOptions: () => {},
    itemsSelected: true,
  },
};

export const MainActionDisabled: Story = {
  args: {
    options,
    entityType: Entitytyping.Work,
    clearSubDropdownOptions: () => {},
    isMainActionDisabled: true,
  },
};

export const OnlySecondaryOptions: Story = {
  args: {
    options: options.filter((option) => !option.primary),
    entityType: Entitytyping.Mediafile,
    clearSubDropdownOptions: () => {},
  },
};
