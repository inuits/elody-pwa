import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementWrapper from "./EntityElementWrapper.vue";
import { BaseLibraryModes } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementWrapper> = {
  title: "Base/EntityElementWrapper",
  component: EntityElementWrapper,
  tags: ["autodocs"],
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
    headerStyle: { control: "select", options: ["normal", "none"] },
  },
  render: (args) => ({
    components: { EntityElementWrapper },
    setup: () => ({ args }),
    template: `
      <div class="w-[36rem] p-4">
        <EntityElementWrapper v-bind="args">
          <template #content>
            <div class="bg-background-light p-4 text-sm text-text-body">
              <p><span class="font-bold">Titel:</span> Zelfportret met strohoed</p>
              <p><span class="font-bold">Objectnummer:</span> OBJ-2024-0157</p>
              <p><span class="font-bold">Datering:</span> 1889</p>
            </div>
          </template>
        </EntityElementWrapper>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementWrapper>;

export const Expanded: Story = {
  args: {
    label: "Metadata",
    entityId: "entity-42",
    isCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    label: "Metadata",
    entityId: "entity-42",
    isCollapsed: true,
  },
};

export const Preview: Story = {
  args: {
    label: "Metadata",
    entityId: "entity-42",
    isCollapsed: false,
    baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
    previewLabel: "Voorvertoning: Zelfportret met strohoed",
  },
};

export const NoHeader: Story = {
  args: {
    label: "Metadata",
    entityId: "entity-42",
    isCollapsed: false,
    headerStyle: "none",
  },
};
